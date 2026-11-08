import { Test, type TestingModule } from '@nestjs/testing';
import type { Mock } from 'vitest';
import { DataSource } from 'typeorm';

import type { SqlExecutor } from '../../common/types/sql-executor.type';
import { ProcessVersionsRepository } from './process-versions.repository';

describe('ProcessVersionsRepository procedure and asset queries', () => {
  let dataSourceQuery: Mock;
  let executorQuery: Mock;
  let executor: SqlExecutor;
  let repository: ProcessVersionsRepository;

  const sampleRow = {
    id: 'v1',
    process_id: 'p1',
    version_number: 1,
    lifecycle_state: 'Draft' as const,
    architecture_state: 'AS-IS' as const,
    title: 'Initial Flow',
    checklist_completed: false,
    derived_from_version_id: null,
    change_description: 'Initial',
    reason_for_change: 'Baseline',
  };

  beforeEach(async () => {
    dataSourceQuery = vi.fn();
    executorQuery = vi.fn();
    executor = { query: executorQuery as SqlExecutor['query'] };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessVersionsRepository,
        {
          provide: DataSource,
          useValue: { query: dataSourceQuery },
        },
      ],
    }).compile();

    repository = module.get<ProcessVersionsRepository>(
      ProcessVersionsRepository,
    );
  });

  it('checks procedure existence for a process version', async () => {
    dataSourceQuery.mockResolvedValue([{ exists: true }]);

    await expect(repository.procedureExists('version-1')).resolves.toBe(true);

    expect(dataSourceQuery).toHaveBeenCalledWith(
      expect.stringContaining('FROM procedures pr'),
      ['version-1'],
    );
  });

  it('clones procedure content through the supplied transaction executor', async () => {
    executorQuery
      .mockResolvedValueOnce([
        {
          code: 'P1.1',
          title: 'Validate request',
          utility: 'Ensure the request is complete',
          warranty: 'Consistent intake',
          outcome: 'Validated request',
          policy: 'Follow intake policy',
          activities: [{ resource: 'Coordinator' }],
          inputs: ['Request form'],
          outputs: ['Validated request'],
        },
      ])
      .mockResolvedValueOnce([]);

    await repository.cloneProceduresForPromotedVersion(
      'source-version',
      'target-version',
      'publisher-1',
      executor,
    );

    expect(executorQuery).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('FROM procedures pr'),
      ['source-version'],
    );
    expect(executorQuery).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO procedures'),
      [
        'target-version',
        'P1.1',
        'Validate request',
        'Ensure the request is complete',
        'Consistent intake',
        'Validated request',
        'Follow intake policy',
        JSON.stringify([{ resource: 'Coordinator' }]),
        JSON.stringify(['Request form']),
        JSON.stringify(['Validated request']),
        'publisher-1',
      ],
    );
  });

  it('clones asset metadata through the supplied transaction executor', async () => {
    executorQuery
      .mockResolvedValueOnce([
        {
          caption: 'Published BPMN',
          asset_type: 'BPMN',
          file_path: 'backoffice/bpmn/file.bpmn',
          mime_type: 'application/xml',
          checksum: 'abc',
          size_bytes: 123,
        },
      ])
      .mockResolvedValueOnce([]);

    await repository.cloneAssetsForPromotedVersion(
      'source-version',
      'target-version',
      'publisher-1',
      executor,
    );

    expect(executorQuery).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('FROM assets a'),
      ['source-version'],
    );
    expect(executorQuery).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO assets'),
      [
        'target-version',
        'Published BPMN',
        'BPMN',
        'backoffice/bpmn/file.bpmn',
        'application/xml',
        'abc',
        123,
        'publisher-1',
      ],
    );
  });

  it('queries process versions, existence flags, counts, and history actors', async () => {
    dataSourceQuery
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([{ count: '2' }])
      .mockResolvedValueOnce([{ actor_id: 'user-1' }])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([{ max_version_number: 3 }]);

    expect(await repository.processExists('p1')).toBe(true);
    expect(await repository.findById('v1', undefined, true)).toMatchObject({
      id: 'v1',
    });
    expect(await repository.findById('missing')).toBeNull();
    expect(await repository.findByProcessId('p1')).toHaveLength(1);
    expect(
      await repository.findByProcessAndVersionNumber('p1', 1),
    ).toMatchObject({ id: 'v1' });
    expect(await repository.countBpmnAssets('v1')).toBe(2);
    expect(await repository.findLatestActorForState('v1', 'In Review')).toBe(
      'user-1',
    );
    expect(
      await repository.findPublishedVersion(
        'p1',
        'AS-IS',
        undefined,
        'v0',
        true,
      ),
    ).toMatchObject({ id: 'v1' });
    expect(await repository.getNextVersionNumber('p1')).toBe(4);
  });

  it('creates, updates, transitions, and records state history', async () => {
    dataSourceQuery
      .mockResolvedValueOnce([{ id: 'v1' }])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([]);

    const created = await repository.create({
      processId: 'p1',
      versionNumber: 1,
      lifecycleState: 'Draft',
      architectureState: 'AS-IS',
      title: 'Initial Flow',
      checklistCompleted: false,
      derivedFromVersionId: null,
      changeDescription: 'Initial',
      reasonForChange: 'Baseline',
      createdBy: 'user-1',
      updatedBy: 'user-1',
    });
    expect(created.id).toBe('v1');

    const updated = await repository.update(
      'v1',
      {
        architectureState: 'TO-BE',
        title: 'Updated',
        checklistCompleted: true,
        derivedFromVersionId: 'v0',
        changeDescription: 'Changed',
        reasonForChange: 'Reason',
      },
      'user-1',
    );
    expect(updated.id).toBe('v1');

    const transitioned = await repository.setLifecycleState(
      'v1',
      'In Review',
      'user-1',
      undefined,
      true,
    );
    expect(transitioned.id).toBe('v1');

    await repository.insertStateHistory({
      processVersionId: 'v1',
      fromState: 'Draft',
      toState: 'In Review',
      actorId: 'user-1',
      reason: 'Ready',
    });
  });
});
