import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { AssetsRepository } from './assets.repository';

describe('AssetsRepository', () => {
  let query: ReturnType<typeof vi.fn>;
  let repository: AssetsRepository;

  const sampleRow = {
    id: 'asset-1',
    process_version_id: 'v1',
    caption: 'Diagram',
    asset_type: 'BPMN',
    file_path: 'uploads/flow.bpmn',
    mime_type: 'application/xml',
    checksum: 'abc123',
    size_bytes: 512,
    is_current: true,
    superseded_at: null,
    superseded_by_asset_id: null,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    query = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsRepository,
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    repository = module.get<AssetsRepository>(AssetsRepository);
  });

  it('creates, finds, and supersedes BPMN assets', async () => {
    query
      .mockResolvedValueOnce([{ id: 'asset-1' }])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const created = await repository.createBpmnAsset({
      processVersionId: 'v1',
      caption: 'Diagram',
      filePath: 'uploads/flow.bpmn',
      mimeType: 'application/xml',
      checksum: 'abc123',
      sizeBytes: 512,
      actorId: 'user-1',
    });
    expect(created.id).toBe('asset-1');

    expect(await repository.findByProcessVersionId('v1')).toHaveLength(1);
    expect(await repository.findCurrentByProcessVersionId('v1')).toMatchObject({
      id: 'asset-1',
    });
    expect(await repository.findCurrentByProcessVersionId('v2')).toBeNull();
    expect(await repository.findById('asset-1')).toMatchObject({
      id: 'asset-1',
    });
    expect(await repository.findById('missing')).toBeNull();

    await repository.supersedeAsset('asset-1', 'asset-2');
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('UPDATE assets'),
      ['asset-1', 'asset-2'],
    );
  });

  it('rejects creation when asset identifier or row is missing', async () => {
    query.mockResolvedValueOnce([]);
    await expect(
      repository.createBpmnAsset({
        processVersionId: 'v1',
        caption: 'Diagram',
        filePath: 'uploads/flow.bpmn',
        mimeType: 'application/xml',
        checksum: 'abc123',
        sizeBytes: 512,
        actorId: 'user-1',
      }),
    ).rejects.toThrow(TypeError);

    query
      .mockResolvedValueOnce([{ id: 'missing-asset' }])
      .mockResolvedValueOnce([]);
    await expect(
      repository.createBpmnAsset({
        processVersionId: 'v1',
        caption: 'Diagram',
        filePath: 'uploads/flow.bpmn',
        mimeType: 'application/xml',
        checksum: 'abc123',
        sizeBytes: 512,
        actorId: 'user-1',
      }),
    ).rejects.toThrow(TypeError);
  });
});
