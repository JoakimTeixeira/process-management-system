import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { TeamsRepository } from './teams.repository';

describe('TeamsRepository', () => {
  let query: ReturnType<typeof vi.fn>;
  let repository: TeamsRepository;

  const sampleRow = {
    id: 'team-1',
    code: 'OPS',
    name: 'Operations',
    description: 'Operations team',
    is_active: true,
  };

  beforeEach(async () => {
    query = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsRepository,
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    repository = module.get<TeamsRepository>(TeamsRepository);
  });

  it('finds all teams and by id', async () => {
    query
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([]);

    const all = await repository.findAll();
    expect(all).toEqual([
      {
        id: 'team-1',
        code: 'OPS',
        name: 'Operations',
        description: 'Operations team',
        isActive: true,
      },
    ]);
    expect(await repository.findById('team-1')).toMatchObject({ id: 'team-1' });
    expect(await repository.findById('missing')).toBeNull();
  });

  it('creates, updates, and deactivates teams and validates required records', async () => {
    query
      .mockResolvedValueOnce([{ id: 'team-1' }])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ ...sampleRow, is_active: false }]);

    const created = await repository.create({
      code: 'OPS',
      name: 'Operations',
      description: 'Operations team',
    });
    expect(created.id).toBe('team-1');

    const unchanged = await repository.update('team-1', {});
    expect(unchanged.id).toBe('team-1');

    const updated = await repository.update('team-1', {
      code: 'OPS2',
      name: 'Operations 2',
      description: 'Updated description',
    });
    expect(updated.id).toBe('team-1');

    const deactivated = await repository.deactivate('team-1');
    expect(deactivated.isActive).toBe(false);

    query.mockResolvedValueOnce([]);
    await expect(
      repository.create({
        code: 'FAIL',
        name: 'Fail',
        description: 'Fail',
      }),
    ).rejects.toThrow(TypeError);

    query
      .mockResolvedValueOnce([{ id: 'missing-team' }])
      .mockResolvedValueOnce([]);
    await expect(
      repository.create({
        code: 'GONE',
        name: 'Gone',
        description: 'Gone',
      }),
    ).rejects.toThrow(TypeError);
  });
});
