import { ConflictException } from '@nestjs/common';
import type { DataSource } from 'typeorm';

import { Role } from '../../common/enums/role.enum';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { ProcessesRepository } from '../processes/processes.repository';
import type { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
import type { ProcessVersionsRepository } from './process-versions.repository';
import { ProcessVersionsService } from './process-versions.service';

describe('ProcessVersionsService', () => {
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;
  let processesRepository: jest.Mocked<Pick<ProcessesRepository, 'findById'>>;
  let processVersionsRepository: jest.Mocked<
    Pick<
      ProcessVersionsRepository,
      | 'countBpmnAssets'
      | 'create'
      | 'delete'
      | 'findById'
      | 'findByProcessAndVersionNumber'
      | 'findLatestActorForState'
      | 'findPublishedVersion'
      | 'insertStateHistory'
      | 'setLifecycleState'
      | 'update'
    >
  >;
  let workflowAuthorizationService: jest.Mocked<
    Pick<
      WorkflowAuthorizationService,
      'assertSameTeamAsProcessOwner' | 'assertSameTeamAsProcessVersionOwner'
    >
  >;
  let auditLogWriterService: jest.Mocked<Pick<AuditLogWriterService, 'create'>>;
  let service: ProcessVersionsService;

  const currentUser: AuthenticatedUser = {
    id: 'publisher-1',
    name: 'Peter Publisher',
    email: 'peter@example.com',
    roleId: 'role-1',
    role: Role.PUBLISHER,
    team: {
      id: 'team-1',
      code: 'HR',
      name: 'Human Resources',
    },
  };

  const approvedVersion = {
    id: 'version-1',
    processId: 'process-1',
    versionNumber: 2,
    lifecycleState: 'Approved',
    architectureState: 'TO-BE',
    title: 'TO-BE version',
    checklistCompleted: true,
    derivedFromVersionId: null,
    changeDescription: 'change',
    reasonForChange: 'reason',
  };

  beforeEach(() => {
    dataSource = {
      transaction: jest.fn(
        async (callback: (manager: DataSource) => Promise<unknown>) =>
          await callback({} as DataSource),
      ),
    };
    processesRepository = {
      findById: jest.fn(),
    };
    processVersionsRepository = {
      countBpmnAssets: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByProcessAndVersionNumber: jest.fn(),
      findLatestActorForState: jest.fn(),
      findPublishedVersion: jest.fn(),
      insertStateHistory: jest.fn(),
      setLifecycleState: jest.fn(),
      update: jest.fn(),
    };
    workflowAuthorizationService = {
      assertSameTeamAsProcessOwner: jest.fn(),
      assertSameTeamAsProcessVersionOwner: jest.fn(),
    };
    auditLogWriterService = {
      create: jest.fn(),
    };
    service = new ProcessVersionsService(
      dataSource as unknown as DataSource,
      processesRepository as unknown as ProcessesRepository,
      processVersionsRepository as unknown as ProcessVersionsRepository,
      workflowAuthorizationService as unknown as WorkflowAuthorizationService,
      auditLogWriterService as unknown as AuditLogWriterService,
    );
  });

  it('should require a BPMN asset before submit for review', async () => {
    processVersionsRepository.findById.mockResolvedValue({
      ...approvedVersion,
      lifecycleState: 'Draft',
    });
    processVersionsRepository.countBpmnAssets.mockResolvedValue(0);

    await expect(
      service.submitForReview(
        'version-1',
        { reason: 'submit' },
        { ...currentUser, role: Role.EDITOR },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should block publish when the approver and publisher are the same actor', async () => {
    processVersionsRepository.findById.mockResolvedValue(approvedVersion);
    processVersionsRepository.countBpmnAssets.mockResolvedValue(1);
    processVersionsRepository.findLatestActorForState.mockResolvedValue(
      currentUser.id,
    );

    await expect(
      service.publish('version-1', { reason: 'publish' }, currentUser),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should block publish when approval evidence is missing', async () => {
    processVersionsRepository.findById.mockResolvedValue(approvedVersion);
    processVersionsRepository.countBpmnAssets.mockResolvedValue(1);
    processVersionsRepository.findLatestActorForState.mockResolvedValue(null);

    await expect(
      service.publish('version-1', { reason: 'publish' }, currentUser),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
