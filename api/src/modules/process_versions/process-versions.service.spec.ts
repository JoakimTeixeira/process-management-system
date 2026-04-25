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
      | 'create'
      | 'delete'
      | 'findById'
      | 'findByProcessAndVersionNumber'
      | 'insertStateHistory'
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
    id: 'editor-1',
    name: 'Erin Editor',
    email: 'erin@example.com',
    roleId: 'role-1',
    role: Role.EDITOR,
    team: {
      id: 'team-1',
      code: 'HR',
      name: 'Human Resources',
    },
  };

  const draftVersion = {
    id: 'version-1',
    processId: 'process-1',
    versionNumber: 1,
    lifecycleState: 'Draft',
    architectureState: 'AS-IS',
    title: 'AS-IS version',
    summary: 'summary',
    checklistCompleted: false,
    derivedFromVersionId: null,
    overview: null,
    notes: null,
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
      create: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByProcessAndVersionNumber: jest.fn(),
      insertStateHistory: jest.fn(),
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

  it('should create a Draft version with initial state history and audit entry', async () => {
    processesRepository.findById.mockResolvedValue({
      id: 'process-1',
      areaId: 'area-1',
      code: '1',
      title: 'Employee relocation',
      summary: null,
      ownerId: 'owner-1',
    });
    processVersionsRepository.findByProcessAndVersionNumber.mockResolvedValue(
      null,
    );
    processVersionsRepository.create.mockResolvedValue(draftVersion);

    await service.create(
      'process-1',
      {
        versionNumber: 1,
        architectureState: 'AS-IS',
        title: 'AS-IS version',
        changeDescription: 'change',
        reasonForChange: 'reason',
      },
      currentUser,
    );

    expect(processVersionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        processId: 'process-1',
        lifecycleState: 'Draft',
        createdBy: currentUser.id,
        updatedBy: currentUser.id,
      }),
      expect.anything(),
    );
    expect(processVersionsRepository.insertStateHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        processVersionId: draftVersion.id,
        fromState: null,
        toState: 'Draft',
        actorId: currentUser.id,
      }),
      expect.anything(),
    );
    expect(auditLogWriterService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'process_version',
        entityId: draftVersion.id,
        action: 'CREATE',
        actorId: currentUser.id,
      }),
      expect.anything(),
    );
  });

  it('should reject direct updates outside Draft', async () => {
    processVersionsRepository.findById.mockResolvedValue({
      ...draftVersion,
      lifecycleState: 'Published',
    });

    await expect(
      service.update('version-1', { title: 'Updated title' }, currentUser),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
