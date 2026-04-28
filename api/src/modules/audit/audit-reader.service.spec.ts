import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { Role } from '../../common/enums/role.enum';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { AuditReaderRepository } from './audit-reader.repository';
import { AuditReaderService } from './audit-reader.service';

describe('AuditReaderService', () => {
  let auditReaderRepository: jest.Mocked<
    Pick<
      AuditReaderRepository,
      'findLogsByEntity' | 'findVersionStateHistory' | 'findWorkflowAuditAccess'
    >
  >;
  let service: AuditReaderService;

  const workflowUser: AuthenticatedUser = {
    id: 'user-1',
    name: 'Workflow User',
    email: 'workflow@example.com',
    roleId: 'role-1',
    role: Role.EDITOR,
    team: {
      id: 'team-1',
      code: 'HR',
      name: 'Human Resources',
    },
  };

  const systemAdmin: AuthenticatedUser = {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    roleId: 'role-2',
    role: Role.SYSTEM_ADMIN,
    team: {
      id: 'team-2',
      code: 'IT',
      name: 'Information Technology',
    },
  };

  beforeEach(() => {
    auditReaderRepository = {
      findLogsByEntity: jest.fn(),
      findWorkflowAuditAccess: jest.fn(),
      findVersionStateHistory: jest.fn(),
    };
    service = new AuditReaderService(
      auditReaderRepository as unknown as AuditReaderRepository,
    );
  });

  it('should list append-only audit logs by entity context', async () => {
    auditReaderRepository.findWorkflowAuditAccess.mockResolvedValue({
      entityExists: true,
      ownerTeamId: 'team-1',
    });
    auditReaderRepository.findLogsByEntity.mockResolvedValue([
      {
        id: 'audit-1',
        entityType: 'process_version',
        entityId: 'version-1',
        action: 'PUBLISH',
        actorId: 'publisher-1',
        actorName: 'Publisher Name',
        reasonForChange: 'Published approved version',
        oldData: null,
        newData: null,
        createdAt: new Date('2026-04-25T10:00:00.000Z'),
      },
    ]);

    await service.listLogsByEntity(
      'process_version',
      'version-1',
      workflowUser,
    );

    expect(auditReaderRepository.findLogsByEntity).toHaveBeenCalledWith(
      'process_version',
      'version-1',
    );
  });

  it('should list lifecycle history for a process version', async () => {
    auditReaderRepository.findWorkflowAuditAccess.mockResolvedValue({
      entityExists: true,
      ownerTeamId: 'team-1',
    });
    auditReaderRepository.findVersionStateHistory.mockResolvedValue([
      {
        id: 'history-1',
        processVersionId: 'version-1',
        fromState: 'Approved',
        toState: 'Published',
        actorId: 'publisher-1',
        actorName: 'Publisher Name',
        reason: 'Published approved version',
        createdAt: new Date('2026-04-25T10:00:00.000Z'),
      },
    ]);

    await service.listVersionStateHistory('version-1', workflowUser);

    expect(auditReaderRepository.findVersionStateHistory).toHaveBeenCalledWith(
      'version-1',
    );
  });

  it('should block workflow users from technical audit entities', async () => {
    await expect(
      service.listLogsByEntity('user', 'user-1', workflowUser),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should allow SYSTEM_ADMIN to consult technical audit entities', async () => {
    auditReaderRepository.findLogsByEntity.mockResolvedValue([]);

    await service.listLogsByEntity('user', 'user-1', systemAdmin);

    expect(auditReaderRepository.findLogsByEntity).toHaveBeenCalledWith(
      'user',
      'user-1',
    );
  });

  it('should reject workflow audit access across teams', async () => {
    auditReaderRepository.findWorkflowAuditAccess.mockResolvedValue({
      entityExists: true,
      ownerTeamId: 'team-2',
    });

    await expect(
      service.listLogsByEntity('process_version', 'version-1', workflowUser),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should reject workflow audit access when the entity does not exist', async () => {
    auditReaderRepository.findWorkflowAuditAccess.mockResolvedValue({
      entityExists: false,
      ownerTeamId: null,
    });

    await expect(
      service.listVersionStateHistory('missing-version', workflowUser),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
