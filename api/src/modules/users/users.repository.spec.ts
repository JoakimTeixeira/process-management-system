import type { Mock } from 'vitest';

import type { DataSource } from 'typeorm';

import { UsersRepository } from './users.repository';

describe('UsersRepository team queries', () => {
  let query: Mock;
  let repository: UsersRepository;

  beforeEach(() => {
    query = vi.fn();

    repository = new UsersRepository({ query } as unknown as DataSource);
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
});
