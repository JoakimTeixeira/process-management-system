import { ConflictException } from '@nestjs/common';

import { Role } from '../../common/enums/role.enum';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { ProcessVersionsRepository } from '../process_versions/process-versions.repository';
import type { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
import type { ProceduresRepository } from './procedures.repository';
import { ProceduresService } from './procedures.service';

describe('ProceduresService', () => {
  let proceduresRepository: jest.Mocked<
    Pick<
      ProceduresRepository,
      | 'create'
      | 'delete'
      | 'findById'
      | 'findByProcessVersionId'
      | 'findByVersionAndCode'
      | 'update'
    >
  >;
  let processVersionsRepository: jest.Mocked<
    Pick<ProcessVersionsRepository, 'findById'>
  >;
  let workflowAuthorizationService: jest.Mocked<
    Pick<
      WorkflowAuthorizationService,
      'assertSameTeamAsProcedureOwner' | 'assertSameTeamAsProcessVersionOwner'
    >
  >;
  let auditLogWriterService: jest.Mocked<Pick<AuditLogWriterService, 'create'>>;
  let service: ProceduresService;

  const currentUser: AuthenticatedUser = {
    id: 'user-1',
    name: 'Alice Editor',
    email: 'alice@example.com',
    roleId: 'role-1',
    role: Role.EDITOR,
    team: {
      id: 'team-1',
      code: 'HR',
      name: 'Human Resources',
    },
  };

  beforeEach(() => {
    proceduresRepository = {
      create: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByProcessVersionId: jest.fn(),
      findByVersionAndCode: jest.fn(),
      update: jest.fn(),
    };
    processVersionsRepository = {
      findById: jest.fn(),
    };
    workflowAuthorizationService = {
      assertSameTeamAsProcedureOwner: jest.fn(),
      assertSameTeamAsProcessVersionOwner: jest.fn(),
    };
    auditLogWriterService = {
      create: jest.fn(),
    };
    service = new ProceduresService(
      proceduresRepository as unknown as ProceduresRepository,
      processVersionsRepository as unknown as ProcessVersionsRepository,
      workflowAuthorizationService as unknown as WorkflowAuthorizationService,
      auditLogWriterService as unknown as AuditLogWriterService,
    );
  });

  it('should reject create when the parent version is not Draft', async () => {
    processVersionsRepository.findById.mockResolvedValue({
      id: 'version-1',
      processId: 'process-1',
      versionNumber: 1,
      lifecycleState: 'Published',
      architectureState: 'AS-IS',
      title: 'Published',
      checklistCompleted: true,
      derivedFromVersionId: null,
      changeDescription: 'change',
      reasonForChange: 'reason',
    });

    await expect(
      service.create(
        'version-1',
        {
          code: '1.1',
          title: 'Procedure',
          utility: 'Provide workflow functionality',
          warranty: 'Procedure executes correctly',
          outcome: 'Expected result is delivered',
          policy: 'Applies to all draft workflow executions',
          activities: [],
          inputs: [],
          outputs: [],
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
