import type { Mock, Mocked } from 'vitest';

import type { DataSource } from 'typeorm';

import type { SqlExecutor } from '../../common/types/sql-executor.type';
import { ProcessVersionsRepository } from './process-versions.repository';

describe('ProcessVersionsRepository procedure and asset queries', () => {
  let dataSource: Mocked<Pick<DataSource, 'query'>>;
  let executorQuery: Mock<SqlExecutor['query']>;
  let executor: Mocked<SqlExecutor>;
  let repository: ProcessVersionsRepository;

  beforeEach(() => {
    dataSource = {
      query: vi.fn(),
    };
    executorQuery = vi.fn();
    executor = { query: executorQuery };
    repository = new ProcessVersionsRepository(
      dataSource as unknown as DataSource,
    );
  });

  it('checks procedure existence for a process version', async () => {
    dataSource.query.mockResolvedValue([{ exists: true }]);

    await expect(repository.procedureExists('version-1')).resolves.toBe(true);

    expect(dataSource.query).toHaveBeenCalledWith(
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
});
