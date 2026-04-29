import { ConflictException, NotFoundException } from '@nestjs/common';

import { Role } from '../../common/enums/role.enum';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { TeamsRepository } from './teams.repository';
import { TeamsService } from './teams.service';

describe('TeamsService', () => {
  let repository: jest.Mocked<
    Pick<
      TeamsRepository,
      'create' | 'deactivate' | 'findAll' | 'findById' | 'update'
    >
  >;
  let auditLogWriterService: jest.Mocked<Pick<AuditLogWriterService, 'create'>>;
  let service: TeamsService;

  const currentUser: AuthenticatedUser = {
    id: 'user-1',
    name: 'Sam Admin',
    email: 'sam.admin@example.com',
    roleId: 'role-1',
    role: Role.SYSTEM_ADMIN,
    team: {
      id: 'team-1',
      code: 'OPS',
      name: 'Operations',
    },
  };

  const existingTeam = {
    id: 'team-1',
    code: 'OPS',
    name: 'Operations',
    description: 'Operations team',
    isActive: true,
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      deactivate: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };
    auditLogWriterService = {
      create: jest.fn(),
    };

    service = new TeamsService(
      repository as unknown as TeamsRepository,
      auditLogWriterService as unknown as AuditLogWriterService,
    );
  });

  it('should list teams', async () => {
    repository.findAll.mockResolvedValue([existingTeam]);

    await expect(service.list()).resolves.toEqual([existingTeam]);
  });

  it('should return a team by id', async () => {
    repository.findById.mockResolvedValue(existingTeam);

    await expect(service.getById('team-1')).resolves.toEqual(existingTeam);
  });

  it('should reject missing teams', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.getById('missing-team')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should create a team and write an audit row', async () => {
    repository.create.mockResolvedValue(existingTeam);

    await expect(
      service.create(
        {
          code: 'OPS',
          name: 'Operations',
          description: 'Operations team',
        },
        currentUser,
      ),
    ).resolves.toEqual(existingTeam);

    expect(auditLogWriterService.create).toHaveBeenCalledWith({
      entityType: 'team',
      entityId: 'team-1',
      action: 'CREATE',
      actorId: 'user-1',
      reasonForChange: 'Created team via SYSTEM_ADMIN',
      newData: existingTeam,
    });
  });

  it('should reject duplicate team creation', async () => {
    repository.create.mockRejectedValue({ code: '23505' });

    await expect(
      service.create(
        {
          code: 'OPS',
          name: 'Operations',
          description: 'Operations team',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should update a team and write an audit row', async () => {
    const updatedTeam = {
      ...existingTeam,
      name: 'Operations and Support',
    };

    repository.findById.mockResolvedValue(existingTeam);
    repository.update.mockResolvedValue(updatedTeam);

    await expect(
      service.update('team-1', { name: 'Operations and Support' }, currentUser),
    ).resolves.toEqual(updatedTeam);

    expect(auditLogWriterService.create).toHaveBeenCalledWith({
      entityType: 'team',
      entityId: 'team-1',
      action: 'UPDATE',
      actorId: 'user-1',
      reasonForChange: 'Updated team via SYSTEM_ADMIN',
      oldData: existingTeam,
      newData: updatedTeam,
    });
  });

  it('should deactivate a team and write an audit row', async () => {
    const deactivatedTeam = {
      ...existingTeam,
      isActive: false,
    };

    repository.findById.mockResolvedValue(existingTeam);
    repository.deactivate.mockResolvedValue(deactivatedTeam);

    await expect(service.deactivate('team-1', currentUser)).resolves.toEqual(
      deactivatedTeam,
    );

    expect(auditLogWriterService.create).toHaveBeenCalledWith({
      entityType: 'team',
      entityId: 'team-1',
      action: 'STATE_CHANGE',
      actorId: 'user-1',
      reasonForChange: 'Deactivated team via SYSTEM_ADMIN',
      oldData: existingTeam,
      newData: deactivatedTeam,
    });
  });
});
