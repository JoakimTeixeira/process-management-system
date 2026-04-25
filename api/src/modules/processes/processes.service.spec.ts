import { ConflictException, NotFoundException } from '@nestjs/common';

import { Role } from '../../common/enums/role.enum';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
import type { ProcessesRepository } from './processes.repository';
import { ProcessesService } from './processes.service';

describe('ProcessesService', () => {
  let repository: jest.Mocked<
    Pick<
      ProcessesRepository,
      | 'areaExists'
      | 'create'
      | 'delete'
      | 'findAll'
      | 'findByCode'
      | 'findById'
      | 'ownerExists'
      | 'update'
    >
  >;
  let workflowAuthorizationService: jest.Mocked<
    Pick<
      WorkflowAuthorizationService,
      'assertSameTeamAsProcessOwner' | 'assertSameTeamAsUser'
    >
  >;
  let auditLogWriterService: jest.Mocked<Pick<AuditLogWriterService, 'create'>>;
  let service: ProcessesService;

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

  const existingProcess = {
    id: 'process-1',
    areaId: 'area-1',
    code: '1',
    title: 'Human Resources Management',
    summary: 'Current process summary',
    ownerId: 'owner-1',
  };

  beforeEach(() => {
    repository = {
      areaExists: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findByCode: jest.fn(),
      findById: jest.fn(),
      ownerExists: jest.fn(),
      update: jest.fn(),
    };
    workflowAuthorizationService = {
      assertSameTeamAsProcessOwner: jest.fn(),
      assertSameTeamAsUser: jest.fn(),
    };
    auditLogWriterService = {
      create: jest.fn(),
    };
    service = new ProcessesService(
      repository as unknown as ProcessesRepository,
      workflowAuthorizationService as unknown as WorkflowAuthorizationService,
      auditLogWriterService as unknown as AuditLogWriterService,
    );
  });

  it('should create a process when validations pass', async () => {
    repository.ownerExists.mockResolvedValue(true);
    repository.areaExists.mockResolvedValue(true);
    repository.findByCode.mockResolvedValue(null);
    repository.create.mockResolvedValue(existingProcess);

    await expect(
      service.create(
        {
          areaId: 'area-1',
          code: '1',
          title: 'Human Resources Management',
          ownerId: 'owner-1',
          summary: 'Current process summary',
        },
        currentUser,
      ),
    ).resolves.toEqual(existingProcess);

    expect(
      workflowAuthorizationService.assertSameTeamAsUser,
    ).toHaveBeenCalledWith('owner-1', currentUser);
  });

  it('should reject create when owner does not exist', async () => {
    repository.ownerExists.mockResolvedValue(false);

    await expect(
      service.create(
        {
          areaId: 'area-1',
          code: '1',
          title: 'Human Resources Management',
          ownerId: 'missing-owner',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should reject duplicate code on create', async () => {
    repository.ownerExists.mockResolvedValue(true);
    repository.areaExists.mockResolvedValue(true);
    repository.findByCode.mockResolvedValue(existingProcess);

    await expect(
      service.create(
        {
          areaId: 'area-1',
          code: '1',
          title: 'Human Resources Management',
          ownerId: 'owner-1',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should enforce same-team ownership on update', async () => {
    repository.findById.mockResolvedValue(existingProcess);
    repository.update.mockResolvedValue({
      ...existingProcess,
      title: 'Updated title',
    });

    await service.update(
      'process-1',
      {
        title: 'Updated title',
      },
      currentUser,
    );

    expect(
      workflowAuthorizationService.assertSameTeamAsProcessOwner,
    ).toHaveBeenCalledWith('process-1', currentUser);
  });
});
