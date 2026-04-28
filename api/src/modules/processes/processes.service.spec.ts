import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { Role } from '../../common/enums/role.enum';
import { UNIQUE_VIOLATION_ERROR_CODE } from '../../common/utils/postgres-error.util';
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
      | 'getNextProcessCode'
      | 'ownerExists'
      | 'teamExists'
      | 'userBelongsToTeam'
      | 'update'
      | 'hasNonDraftVersions'
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
    description: 'Current process description',
    teamId: 'team-1',
    teamName: 'Human Resources',
    ownerId: 'owner-1',
    ownerName: 'Owner Name',
  };

  beforeEach(() => {
    repository = {
      areaExists: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findByCode: jest.fn(),
      findById: jest.fn(),
      getNextProcessCode: jest.fn(),
      ownerExists: jest.fn(),
      teamExists: jest.fn(),
      userBelongsToTeam: jest.fn(),
      update: jest.fn(),
      hasNonDraftVersions: jest.fn(),
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
    repository.teamExists.mockResolvedValue(true);
    repository.userBelongsToTeam.mockResolvedValue(true);
    repository.areaExists.mockResolvedValue(true);
    repository.findByCode.mockResolvedValue(null);
    repository.getNextProcessCode.mockResolvedValue('1');
    repository.create.mockResolvedValue(existingProcess);

    await expect(
      service.create(
        {
          areaId: 'area-1',
          teamId: 'team-1',
          title: 'Human Resources Management',
          ownerId: 'owner-1',
          description: 'Current process description',
        },
        currentUser,
      ),
    ).resolves.toEqual(existingProcess);

    expect(
      workflowAuthorizationService.assertSameTeamAsUser,
    ).toHaveBeenCalledWith('owner-1', currentUser);
    expect(auditLogWriterService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'process',
        entityId: 'process-1',
        action: 'CREATE',
        actorId: 'user-1',
      }),
    );
  });

  it('should reject create when owner does not exist', async () => {
    repository.teamExists.mockResolvedValue(true);
    repository.ownerExists.mockResolvedValue(false);

    await expect(
      service.create(
        {
          areaId: 'area-1',
          teamId: 'team-1',
          title: 'Human Resources Management',
          ownerId: 'missing-owner',
          description: 'Test description',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should reject duplicate code on create', async () => {
    repository.ownerExists.mockResolvedValue(true);
    repository.teamExists.mockResolvedValue(true);
    repository.userBelongsToTeam.mockResolvedValue(true);
    repository.areaExists.mockResolvedValue(true);
    repository.getNextProcessCode.mockResolvedValue('1');
    repository.create.mockRejectedValue({
      code: UNIQUE_VIOLATION_ERROR_CODE,
      constraint: 'processes_code_key',
    });

    await expect(
      service.create(
        {
          areaId: 'area-1',
          teamId: 'team-1',
          title: 'Human Resources Management',
          ownerId: 'owner-1',
          description: 'Test description',
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

  it('should write an audit row on update', async () => {
    repository.findById.mockResolvedValue(existingProcess);
    repository.update.mockResolvedValue({
      ...existingProcess,
      title: 'Updated title',
    });

    await expect(
      service.update(
        'process-1',
        {
          title: 'Updated title',
        },
        currentUser,
      ),
    ).resolves.toEqual({
      ...existingProcess,
      title: 'Updated title',
    });

    expect(auditLogWriterService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'process',
        entityId: 'process-1',
        action: 'UPDATE',
        actorId: 'user-1',
      }),
    );
  });

  it('should reject create when owner is not in the selected team', async () => {
    repository.ownerExists.mockResolvedValue(true);
    repository.teamExists.mockResolvedValue(true);
    repository.userBelongsToTeam.mockResolvedValue(false);

    await expect(
      service.create(
        {
          areaId: 'area-1',
          teamId: 'team-1',
          title: 'Human Resources Management',
          ownerId: 'owner-9',
          description: 'Test description',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should delete a process and write an audit row', async () => {
    repository.findById.mockResolvedValue(existingProcess);
    repository.hasNonDraftVersions.mockResolvedValue(false);

    await expect(
      service.delete('process-1', currentUser),
    ).resolves.toBeUndefined();

    expect(repository.hasNonDraftVersions).toHaveBeenCalledWith('process-1');
    expect(repository.delete).toHaveBeenCalledWith('process-1');
    expect(auditLogWriterService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'process',
        entityId: 'process-1',
        action: 'DELETE',
        actorId: 'user-1',
      }),
    );
  });

  it('should reject deletion when process has non-Draft versions', async () => {
    repository.findById.mockResolvedValue(existingProcess);
    repository.hasNonDraftVersions.mockResolvedValue(true);

    await expect(service.delete('process-1', currentUser)).rejects.toThrow(
      'Cannot delete process with non-Draft versions. Only processes with only Draft versions can be deleted.',
    );

    expect(repository.hasNonDraftVersions).toHaveBeenCalledWith('process-1');
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should reject non-editor process mutation at the service layer', async () => {
    await expect(
      service.create(
        {
          areaId: 'area-1',
          teamId: 'team-1',
          title: 'Human Resources Management',
          ownerId: 'owner-1',
          description: 'Current process description',
        },
        { ...currentUser, role: Role.REVIEWER },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
