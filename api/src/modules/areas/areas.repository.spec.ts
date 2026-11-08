import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { AreasRepository } from './areas.repository';

describe('AreasRepository', () => {
  let query: ReturnType<typeof vi.fn>;
  let repository: AreasRepository;

  const sampleRow = {
    id: 'area-1',
    code: 'A1',
    title: 'Service Operation',
    description: 'Manage live services',
    team_id: 'team-1',
    team_name: 'Operations',
    owner_id: 'user-1',
    owner_name: 'Owner Name',
    itil_practice_id: 'practice-1',
    practice_name: 'Incident Management',
  };

  beforeEach(async () => {
    query = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AreasRepository,
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    repository = module.get<AreasRepository>(AreasRepository);
  });

  it('finds all areas, by id, and by code', async () => {
    query
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleRow]);

    const all = await repository.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].code).toBe('A1');

    expect(await repository.findById('area-1')).toMatchObject({
      id: 'area-1',
      teamId: 'team-1',
    });
    expect(await repository.findById('missing')).toBeNull();
    expect(await repository.findByCode('A1')).toMatchObject({ id: 'area-1' });
  });

  it('checks ownership, team membership, and child processes', async () => {
    query
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([{ exists: false }])
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([]);

    expect(await repository.ownerExists('user-1')).toBe(true);
    expect(await repository.teamExists('team-1')).toBe(false);
    expect(await repository.userBelongsToTeam('user-1', 'team-1')).toBe(true);
    expect(await repository.hasProcesses('area-1')).toBe(true);
    expect(await repository.hasProcesses('area-2')).toBe(false);
  });

  it('computes the next area code', async () => {
    query
      .mockResolvedValueOnce([{ max_code_number: null }])
      .mockResolvedValueOnce([{ max_code_number: 4 }]);

    expect(await repository.getNextAreaCode()).toBe('A1');
    expect(await repository.getNextAreaCode()).toBe('A5');
  });

  it('creates, updates, and deletes areas and validates required identifiers', async () => {
    query
      .mockResolvedValueOnce([{ id: 'area-1' }])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([]);

    const created = await repository.create({
      code: 'A1',
      title: 'Service Operation',
      description: 'Manage live services',
      teamId: 'team-1',
      ownerId: 'user-1',
      itilPracticeId: 'practice-1',
      actorId: 'user-1',
    });
    expect(created.id).toBe('area-1');

    const updated = await repository.update(
      'area-1',
      {
        title: 'Updated Title',
        description: 'Updated Description',
        teamId: 'team-1',
        ownerId: 'user-1',
        itilPracticeId: 'practice-1',
      },
      'user-1',
    );
    expect(updated.id).toBe('area-1');

    await repository.delete('area-1');
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('DELETE FROM areas'),
      ['area-1'],
    );

    query.mockResolvedValueOnce([]);
    await expect(
      repository.create({
        code: 'A2',
        title: 'Missing ID',
        description: null,
        teamId: 'team-1',
        ownerId: 'user-1',
        itilPracticeId: 'practice-1',
        actorId: 'user-1',
      }),
    ).rejects.toThrow(TypeError);

    query
      .mockResolvedValueOnce([{ id: 'area-missing' }])
      .mockResolvedValueOnce([]);
    await expect(
      repository.create({
        code: 'A3',
        title: 'Vanished Row',
        description: null,
        teamId: 'team-1',
        ownerId: 'user-1',
        itilPracticeId: 'practice-1',
        actorId: 'user-1',
      }),
    ).rejects.toThrow(TypeError);
  });
});
