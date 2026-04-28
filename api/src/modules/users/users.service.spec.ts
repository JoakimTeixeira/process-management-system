import { ConflictException, NotFoundException } from '@nestjs/common';

import type { ConfigType } from '@nestjs/config';

import authConfig from '../../config/auth.config';
import { Role } from '../../common/enums/role.enum';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import type { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersRepository: jest.Mocked<
    Pick<
      UsersRepository,
      | 'findOwnerOptionsByTeamId'
      | 'findAllOwnerOptions'
      | 'findTeamOptions'
      | 'findAll'
      | 'findById'
      | 'findRoleById'
      | 'findRoleByName'
      | 'teamExists'
      | 'create'
      | 'update'
      | 'updatePasswordHash'
    >
  >;
  let auditLogWriterService: jest.Mocked<Pick<AuditLogWriterService, 'create'>>;
  let service: UsersService;

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

  const authConfiguration: ConfigType<typeof authConfig> = {
    jwtSecret: 'secret',
    jwtExpiresIn: '15m',
    jwtExpiresInSeconds: 900,
    passwordPepper: 'pepper',
  };

  beforeEach(() => {
    usersRepository = {
      findOwnerOptionsByTeamId: jest.fn(),
      findAllOwnerOptions: jest.fn(),
      findTeamOptions: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findRoleById: jest.fn(),
      findRoleByName: jest.fn(),
      teamExists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updatePasswordHash: jest.fn(),
    };
    auditLogWriterService = {
      create: jest.fn(),
    };

    service = new UsersService(
      usersRepository as unknown as UsersRepository,
      auditLogWriterService as unknown as AuditLogWriterService,
      authConfiguration,
    );
  });

  it('should return same-team owner options', async () => {
    usersRepository.teamExists.mockResolvedValue(true);
    usersRepository.findOwnerOptionsByTeamId.mockResolvedValue([
      { id: 'owner-1', name: 'Alice Owner', teamId: 'team-1', isActive: true },
    ]);

    await expect(service.listOwnerOptions(currentUser)).resolves.toEqual([
      { id: 'owner-1', name: 'Alice Owner', teamId: 'team-1', isActive: true },
    ]);
    expect(usersRepository.findOwnerOptionsByTeamId).toHaveBeenCalledWith(
      'team-1',
    );
  });

  it('should return owner options for a selected team', async () => {
    usersRepository.teamExists.mockResolvedValue(true);
    usersRepository.findOwnerOptionsByTeamId.mockResolvedValue([
      { id: 'owner-2', name: 'Bob Owner', teamId: 'team-2', isActive: true },
    ]);

    await expect(service.listOwnerOptionsByTeamId('team-2')).resolves.toEqual([
      { id: 'owner-2', name: 'Bob Owner', teamId: 'team-2', isActive: true },
    ]);
    expect(usersRepository.teamExists).toHaveBeenCalledWith('team-2');
    expect(usersRepository.findOwnerOptionsByTeamId).toHaveBeenCalledWith(
      'team-2',
    );
  });

  it('should reject selected-team owner lookup when the team is missing', async () => {
    usersRepository.teamExists.mockResolvedValue(false);

    await expect(
      service.listOwnerOptionsByTeamId('missing-team'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should reject updates when the team is missing', async () => {
    usersRepository.findById.mockResolvedValue({
      id: 'user-2',
      name: 'Alice',
      email: 'alice@example.com',
      isActive: true,
      role: { id: 'role-2', name: Role.EDITOR },
      team: { id: 'team-2', code: 'HR', name: 'Human Resources' },
    });
    usersRepository.teamExists.mockResolvedValue(false);

    await expect(
      service.update('user-2', { teamId: 'missing-team' }, currentUser),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should reset password and write an audit row', async () => {
    usersRepository.findById.mockResolvedValue({
      id: 'user-2',
      name: 'Alice',
      email: 'alice@example.com',
      isActive: true,
      role: { id: 'role-2', name: Role.EDITOR },
      team: { id: 'team-2', code: 'HR', name: 'Human Resources' },
    });
    usersRepository.updatePasswordHash.mockResolvedValue({
      id: 'user-2',
      name: 'Alice',
      email: 'alice@example.com',
      isActive: true,
      role: { id: 'role-2', name: Role.EDITOR },
      team: { id: 'team-2', code: 'HR', name: 'Human Resources' },
    });

    const result = await service.resetPassword(
      'user-2',
      { newPassword: 'temporaryPassword123' },
      currentUser,
    );

    expect(result.id).toBe('user-2');
    expect(usersRepository.updatePasswordHash).toHaveBeenCalledWith(
      'user-2',
      expect.any(String),
    );
    expect(auditLogWriterService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'user',
        entityId: 'user-2',
        action: 'USER_UPDATE',
        actorId: 'user-1',
        reasonForChange: 'Reset user password via SYSTEM_ADMIN',
      }),
    );
  });

  it('should reactivate a user without re-writing unchanged email, role, or team', async () => {
    usersRepository.findById.mockResolvedValue({
      id: 'user-2',
      name: 'Peter Publisher',
      email: 'peter.publisher@entity.gov',
      isActive: false,
      role: { id: 'role-3', name: Role.PUBLISHER },
      team: { id: 'team-2', code: 'HR', name: 'Human Resources' },
    });
    usersRepository.update.mockResolvedValue({
      id: 'user-2',
      name: 'Peter Publisher',
      email: 'peter.publisher@entity.gov',
      isActive: true,
      role: { id: 'role-3', name: Role.PUBLISHER },
      team: { id: 'team-2', code: 'HR', name: 'Human Resources' },
    });

    const result = await service.update(
      'user-2',
      {
        name: 'Peter Publisher',
        email: 'peter.publisher@entity.gov',
        roleName: Role.PUBLISHER,
        teamId: 'team-2',
        isActive: true,
      },
      currentUser,
    );

    expect(result.isActive).toBe(true);
    expect(usersRepository.teamExists).not.toHaveBeenCalled();
    expect(usersRepository.findRoleByName).not.toHaveBeenCalled();
    expect(usersRepository.update).toHaveBeenCalledWith('user-2', {
      isActive: true,
    });
  });

  it('should require a role identifier or role name during create', async () => {
    usersRepository.teamExists.mockResolvedValue(true);

    const invalidDto: CreateUserDto = {
      name: 'Alice',
      email: 'alice@example.com',
      teamId: 'team-2',
      password: 'password',
      hasValidRoleName: () => false,
    };

    await expect(
      service.create(invalidDto, currentUser),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
