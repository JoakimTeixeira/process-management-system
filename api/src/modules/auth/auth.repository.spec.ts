import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { Role } from '../../common/enums/role.enum';
import { AuthRepository } from './auth.repository';

describe('AuthRepository', () => {
  let query: ReturnType<typeof vi.fn>;
  let repository: AuthRepository;

  const sampleRow = {
    user_id: 'u1',
    user_name: 'Alice',
    user_email: 'alice@example.com',
    password_hash: 'hash',
    is_active: true,
    role_id: 'r1',
    role_name: 'EDITOR',
    team_id: 't1',
    team_code: 'OPS',
    team_name: 'Operations',
  };

  beforeEach(async () => {
    query = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
  });

  it('finds users by email and id and maps optional team data', async () => {
    query
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          ...sampleRow,
          team_id: null,
          team_code: null,
          team_name: null,
        },
      ]);

    const byEmail = await repository.findUserByEmail('alice@example.com');
    expect(byEmail).toEqual({
      id: 'u1',
      name: 'Alice',
      email: 'alice@example.com',
      passwordHash: 'hash',
      isActive: true,
      roleId: 'r1',
      role: Role.EDITOR,
      team: { id: 't1', code: 'OPS', name: 'Operations' },
    });

    expect(await repository.findUserByEmail('missing@example.com')).toBeNull();

    const byId = await repository.findUserById('u1');
    expect(byId?.team).toBeNull();
  });
});
