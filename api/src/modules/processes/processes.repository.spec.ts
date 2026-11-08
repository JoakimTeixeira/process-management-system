import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { ProcessesRepository } from './processes.repository';

describe('ProcessesRepository', () => {
  let query: ReturnType<typeof vi.fn>;
  let repository: ProcessesRepository;

  const sampleRow = {
    id: 'process-1',
    area_id: 'area-1',
    code: '1',
    title: 'Incident Management',
    description: 'Restore service',
    team_id: 'team-1',
    team_name: 'Operations',
    owner_id: 'user-1',
    owner_name: 'Owner Name',
  };

  beforeEach(async () => {
    query = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessesRepository,
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    repository = module.get<ProcessesRepository>(ProcessesRepository);
  });

  it('finds processes and maps governance summaries', async () => {
    query
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([
        {
          ...sampleRow,
          current_as_is_id: 'v1',
          current_as_is_version: 1,
          current_as_is_state: 'Published',
          current_to_be_id: 'v2',
          current_to_be_version: 2,
          current_to_be_state: 'Published',
          active_workflow_id: 'v3',
          active_workflow_version: 3,
          active_workflow_architecture: 'TO-BE',
          active_workflow_state: 'Draft',
          total_versions: 3,
          archived_versions: 0,
        },
        {
          ...sampleRow,
          id: 'process-2',
          current_as_is_id: null,
          current_as_is_version: null,
          current_as_is_state: null,
          current_to_be_id: null,
          current_to_be_version: null,
          current_to_be_state: null,
          active_workflow_id: null,
          active_workflow_version: null,
          active_workflow_architecture: null,
          active_workflow_state: null,
          total_versions: null,
          archived_versions: null,
        },
      ])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([]);

    expect(await repository.findAll()).toHaveLength(1);

    const withGov = await repository.findAllWithGovernanceSummary();
    expect(withGov[0].governanceSummary?.currentAsIsVersion?.id).toBe('v1');
    expect(withGov[0].governanceSummary?.currentToBeVersion?.id).toBe('v2');
    expect(withGov[0].governanceSummary?.activeWorkflowVersion?.id).toBe('v3');
    expect(withGov[1].governanceSummary?.versionCounts).toEqual({
      total: 0,
      archived: 0,
    });

    expect(await repository.findById('process-1')).toMatchObject({
      id: 'process-1',
    });
    expect(await repository.findById('missing')).toBeNull();
    expect(await repository.findByCode('1')).toMatchObject({ id: 'process-1' });
    expect(await repository.findByCode('missing')).toBeNull();
  });

  it('checks area, owner, team, version existence, and next process code', async () => {
    query
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([{ exists: false }])
      .mockResolvedValueOnce([{ max_code_number: null }])
      .mockResolvedValueOnce([{ max_code_number: 7 }]);

    expect(await repository.areaExists('area-1')).toBe(true);
    expect(await repository.areaExists('missing')).toBe(false);
    expect(await repository.ownerExists('user-1')).toBe(true);
    expect(await repository.teamExists('team-1')).toBe(true);
    expect(await repository.userBelongsToTeam('user-1', 'team-1')).toBe(true);
    expect(await repository.hasAnyVersions('process-1')).toBe(false);
    expect(await repository.getNextProcessCode()).toBe('1');
    expect(await repository.getNextProcessCode()).toBe('8');
  });

  it('creates, updates, and deletes processes and validates required records', async () => {
    query
      .mockResolvedValueOnce([{ id: 'process-1' }])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([]);

    const created = await repository.create({
      areaId: 'area-1',
      code: '1',
      title: 'Incident Management',
      description: 'Restore service',
      teamId: 'team-1',
      ownerId: 'user-1',
      actorId: 'user-1',
    });
    expect(created.id).toBe('process-1');

    const updated = await repository.update(
      'process-1',
      {
        areaId: 'area-1',
        title: 'Updated',
        description: 'Updated',
        teamId: 'team-1',
        ownerId: 'user-1',
      },
      'user-1',
    );
    expect(updated.id).toBe('process-1');

    await repository.delete('process-1');

    query.mockResolvedValueOnce([]);
    await expect(
      repository.create({
        areaId: 'area-1',
        code: '2',
        title: 'No ID',
        description: 'Desc',
        teamId: 'team-1',
        ownerId: 'user-1',
        actorId: 'user-1',
      }),
    ).rejects.toThrow(TypeError);

    query
      .mockResolvedValueOnce([{ id: 'p-missing' }])
      .mockResolvedValueOnce([]);
    await expect(
      repository.create({
        areaId: 'area-1',
        code: '3',
        title: 'Missing Row',
        description: 'Desc',
        teamId: 'team-1',
        ownerId: 'user-1',
        actorId: 'user-1',
      }),
    ).rejects.toThrow(TypeError);
  });
});
