import { Test, type TestingModule } from '@nestjs/testing';
import type { Mock } from 'vitest';
import { DataSource } from 'typeorm';

import { Role } from '../../common/enums/role.enum';
import { UsersRepository } from './users.repository';

describe('UsersRepository team queries', () => {
  let query: Mock;
  let repository: UsersRepository;

  const sampleUserRow = {
    user_id: 'user-1',
    user_name: 'Alice',
    user_email: 'alice@example.com',
    is_active: true,
    role_id: 'role-1',
    role_name: 'EDITOR',
    team_id: 'team-1',
    team_code: 'OPS',
    team_name: 'Operations',
  };

  beforeEach(async () => {
    query = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('returns only active teams from team options', async () => {
    query.mockResolvedValue([
      {
        id: 'team-1',
        code: 'OPS',
        name: 'Operations',
      },
    ]);

    await expect(repository.findTeamOptions()).resolves.toEqual([
      {
        id: 'team-1',
        code: 'OPS',
        name: 'Operations',
      },
    ]);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('t.is_active = TRUE'),
      [],
    );
  });

  it('requires teams to be active when checking existence', async () => {
    query.mockResolvedValue([{ exists: true }]);

    await expect(repository.teamExists('team-1')).resolves.toBe(true);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('t.is_active = TRUE'),
      ['team-1'],
    );
  });

  it('finds owner options, users, and roles', async () => {
    query
      .mockResolvedValueOnce([
        { id: 'user-1', name: 'Alice', team_id: 'team-1', is_active: true },
      ])
      .mockResolvedValueOnce([
        { id: 'user-1', name: 'Alice', team_id: 'team-1', is_active: true },
      ])
      .mockResolvedValueOnce([sampleUserRow])
      .mockResolvedValueOnce([sampleUserRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleUserRow])
      .mockResolvedValueOnce([{ id: 'role-1', name: 'EDITOR' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'role-1', name: 'EDITOR' }])
      .mockResolvedValueOnce([]);

    expect(await repository.findOwnerOptionsByTeamId('team-1')).toHaveLength(1);
    expect(await repository.findAllOwnerOptions()).toHaveLength(1);
    expect(await repository.findAll()).toHaveLength(1);
    expect(await repository.findById('user-1')).toMatchObject({ id: 'user-1' });
    expect(await repository.findById('missing')).toBeNull();
    expect(await repository.findByEmail('alice@example.com')).toMatchObject({
      id: 'user-1',
    });
    expect(await repository.findRoleById('role-1')).toEqual({
      id: 'role-1',
      name: Role.EDITOR,
    });
    expect(await repository.findRoleById('missing')).toBeNull();
    expect(await repository.findRoleByName(Role.EDITOR)).toEqual({
      id: 'role-1',
      name: Role.EDITOR,
    });
    expect(await repository.findRoleByName(Role.VIEWER)).toBeNull();
  });

  it('creates and updates users and password hashes', async () => {
    query
      .mockResolvedValueOnce([{ id: 'user-1' }])
      .mockResolvedValueOnce([sampleUserRow])
      .mockResolvedValueOnce([sampleUserRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleUserRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleUserRow]);

    const created = await repository.create({
      name: 'Alice',
      email: 'alice@example.com',
      passwordHash: 'hash',
      roleId: 'role-1',
      teamId: 'team-1',
    });
    expect(created.id).toBe('user-1');

    const unchanged = await repository.update('user-1', {});
    expect(unchanged.id).toBe('user-1');

    const updated = await repository.update('user-1', {
      name: 'Alice Updated',
      email: 'alice2@example.com',
      roleId: 'role-1',
      teamId: 'team-1',
      isActive: false,
    });
    expect(updated.id).toBe('user-1');

    const afterPassword = await repository.updatePasswordHash(
      'user-1',
      'new-hash',
    );
    expect(afterPassword.id).toBe('user-1');
  });
});
