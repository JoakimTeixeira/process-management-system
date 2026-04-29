import type { DataSource } from 'typeorm';

import { UsersRepository } from './users.repository';

describe('UsersRepository team queries', () => {
  let dataSource: jest.Mocked<Pick<DataSource, 'query'>>;
  let repository: UsersRepository;

  beforeEach(() => {
    dataSource = {
      query: jest.fn(),
    };

    repository = new UsersRepository(dataSource as unknown as DataSource);
  });

  it('returns only active teams from team options', async () => {
    dataSource.query.mockResolvedValue([
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

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('t.is_active = TRUE'),
      [],
    );
  });

  it('requires teams to be active when checking existence', async () => {
    dataSource.query.mockResolvedValue([{ exists: true }]);

    await expect(repository.teamExists('team-1')).resolves.toBe(true);

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('t.is_active = TRUE'),
      ['team-1'],
    );
  });
});
