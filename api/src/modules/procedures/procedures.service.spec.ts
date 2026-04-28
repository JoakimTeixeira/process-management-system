import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

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
      | 'findAllForBackoffice'
      | 'findById'
      | 'findByProcessVersionId'
      | 'getNextProcedureCode'
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
      findAllForBackoffice: jest.fn(),
      findById: jest.fn(),
      findByProcessVersionId: jest.fn(),
      getNextProcedureCode: jest.fn(),
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
          title: 'Procedure',
          utility: 'Provide workflow functionality',
          warranty: 'Procedure executes correctly',
          outcome: 'Expected result is delivered',
          policy: 'Applies to all draft workflow executions',
          activities: [
            {
              resource: 'Coordinator',
              serviceAction: 'Validate request',
              workInstruction: 'Check the submission fields',
            },
          ],
          inputs: ['Request form'],
          outputs: ['Validated request'],
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should auto-generate the next procedure code on create', async () => {
    processVersionsRepository.findById.mockResolvedValue({
      id: 'version-1',
      processId: 'process-1',
      versionNumber: 1,
      lifecycleState: 'Draft',
      architectureState: 'AS-IS',
      title: 'Draft',
      checklistCompleted: false,
      derivedFromVersionId: null,
      changeDescription: 'change',
      reasonForChange: 'reason',
    });
    proceduresRepository.getNextProcedureCode.mockResolvedValue('1.1');
    proceduresRepository.create.mockResolvedValue({
      id: 'procedure-1',
      processVersionId: 'version-1',
      code: '1.1',
      title: 'Procedure',
      utility: 'Provide workflow functionality',
      warranty: 'Procedure executes correctly',
      outcome: 'Expected result is delivered',
      policy: 'Applies to all draft workflow executions',
      activities: [
        {
          resource: 'Coordinator',
          service_action: 'Validate request',
          work_instruction: 'Check the submission fields',
        },
      ],
      inputs: ['Request form'],
      outputs: ['Validated request'],
    });

    const procedure = await service.create(
      'version-1',
      {
        title: 'Procedure',
        utility: 'Provide workflow functionality',
        warranty: 'Procedure executes correctly',
        outcome: 'Expected result is delivered',
        policy: 'Applies to all draft workflow executions',
        activities: [
          {
            resource: 'Coordinator',
            serviceAction: 'Validate request',
            workInstruction: 'Check the submission fields',
          },
        ],
        inputs: ['Request form'],
        outputs: ['Validated request'],
      },
      currentUser,
    );

    expect(proceduresRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        processVersionId: 'version-1',
        code: '1.1',
      }),
    );
    expect(procedure.code).toBe('1.1');
    expect(
      workflowAuthorizationService.assertSameTeamAsProcessVersionOwner,
    ).toHaveBeenCalledWith('version-1', currentUser);
    expect(auditLogWriterService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'procedure',
        entityId: 'procedure-1',
        action: 'CREATE',
        actorId: currentUser.id,
      }),
    );
  });

  it('should reject code changes on update', async () => {
    proceduresRepository.findById.mockResolvedValue({
      id: 'procedure-1',
      processVersionId: 'version-1',
      code: '1.1',
      title: 'Procedure',
      utility: 'Provide workflow functionality',
      warranty: 'Procedure executes correctly',
      outcome: 'Expected result is delivered',
      policy: 'Applies to all draft workflow executions',
      activities: [],
      inputs: [],
      outputs: [],
    });
    processVersionsRepository.findById.mockResolvedValue({
      id: 'version-1',
      processId: 'process-1',
      versionNumber: 1,
      lifecycleState: 'Draft',
      architectureState: 'AS-IS',
      title: 'Draft',
      checklistCompleted: false,
      derivedFromVersionId: null,
      changeDescription: 'change',
      reasonForChange: 'reason',
    });

    await expect(
      service.update('procedure-1', { code: '1.9' } as never, currentUser),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject incomplete updates when required procedure content is missing', async () => {
    proceduresRepository.findById.mockResolvedValue({
      id: 'procedure-1',
      processVersionId: 'version-1',
      code: '1.1',
      title: 'Procedure',
      utility: 'Provide workflow functionality',
      warranty: 'Procedure executes correctly',
      outcome: 'Expected result is delivered',
      policy: 'Applies to all draft workflow executions',
      activities: [
        {
          resource: 'Coordinator',
          service_action: 'Validate request',
          work_instruction: 'Check the submission fields',
        },
      ],
      inputs: ['Request form'],
      outputs: ['Validated request'],
    });
    processVersionsRepository.findById.mockResolvedValue({
      id: 'version-1',
      processId: 'process-1',
      versionNumber: 1,
      lifecycleState: 'Draft',
      architectureState: 'AS-IS',
      title: 'Draft',
      checklistCompleted: false,
      derivedFromVersionId: null,
      changeDescription: 'change',
      reasonForChange: 'reason',
    });

    await expect(
      service.update(
        'procedure-1',
        {
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
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject deletion when procedure has a generated code', async () => {
    proceduresRepository.findById.mockResolvedValue({
      id: 'procedure-1',
      processVersionId: 'version-1',
      code: '1.1',
      title: 'Procedure',
      utility: 'Provide workflow functionality',
      warranty: 'Procedure executes correctly',
      outcome: 'Expected result is delivered',
      policy: 'Applies to all draft workflow executions',
      activities: [],
      inputs: [],
      outputs: [],
    });
    processVersionsRepository.findById.mockResolvedValue({
      id: 'version-1',
      processId: 'process-1',
      versionNumber: 1,
      lifecycleState: 'Draft',
      architectureState: 'AS-IS',
      title: 'Draft',
      checklistCompleted: false,
      derivedFromVersionId: null,
      changeDescription: 'change',
      reasonForChange: 'reason',
    });

    await expect(service.delete('procedure-1', currentUser)).rejects.toThrow(
      'Cannot delete procedure with a generated code. To maintain code continuity, procedures with codes cannot be deleted.',
    );

    expect(proceduresRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject non-editor procedure mutation at the service layer', async () => {
    await expect(
      service.create(
        'version-1',
        {
          title: 'Procedure',
          utility: 'Provide workflow functionality',
          warranty: 'Procedure executes correctly',
          outcome: 'Expected result is delivered',
          policy: 'Applies to all draft workflow executions',
          activities: [
            {
              resource: 'Coordinator',
              serviceAction: 'Validate request',
              workInstruction: 'Check the submission fields',
            },
          ],
          inputs: ['Request form'],
          outputs: ['Validated request'],
        },
        { ...currentUser, role: Role.REVIEWER },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should reject procedure reads for non-content roles', async () => {
    await expect(
      service.listByProcessVersionId('version-1', {
        ...currentUser,
        role: Role.SYSTEM_ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should list all procedures for content roles', async () => {
    proceduresRepository.findAllForBackoffice.mockResolvedValue([
      {
        id: 'procedure-1',
        processVersionId: 'version-1',
        processId: 'process-1',
        processCode: 'P.001',
        processTitle: 'Change Control',
        versionNumber: 2,
        lifecycleState: 'In Review',
        architectureState: 'TO-BE',
        code: 'P.001.1',
        title: 'Assess change request',
        utility: 'Guide the triage flow',
        warranty: 'Consistent change handling',
        outcome: 'Request classified correctly',
        policy: 'Mandatory for standard changes',
        activities: [],
        inputs: [],
        outputs: [],
      },
    ]);

    await expect(service.listAll(currentUser)).resolves.toEqual([
      expect.objectContaining({
        id: 'procedure-1',
        processCode: 'P.001',
        versionNumber: 2,
      }),
    ]);
  });
});
