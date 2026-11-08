import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { PublicPortalAssetsService } from './public-portal-assets.service';
import { PublicProceduresRepository } from './public-procedures.repository';
import { PublicProcessesRepository } from './public-processes.repository';

describe('PublicPortal repositories and assets service', () => {
  let query: ReturnType<typeof vi.fn>;
  let processesRepository: PublicProcessesRepository;
  let proceduresRepository: PublicProceduresRepository;
  let assetsService: PublicPortalAssetsService;

  beforeEach(async () => {
    query = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicProcessesRepository,
        PublicProceduresRepository,
        PublicPortalAssetsService,
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    processesRepository = module.get<PublicProcessesRepository>(
      PublicProcessesRepository,
    );
    proceduresRepository = module.get<PublicProceduresRepository>(
      PublicProceduresRepository,
    );
    assetsService = module.get<PublicPortalAssetsService>(
      PublicPortalAssetsService,
    );
  });

  it('queries public processes, versions, and BPMN assets with filters', async () => {
    query
      .mockResolvedValueOnce([{ id: 'p1' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'p1' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'v1' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'v1' }])
      .mockResolvedValueOnce([{ file_path: 'bpmn/p1.bpmn' }])
      .mockResolvedValueOnce([]);

    expect(
      await processesRepository.listProcesses({
        search: 'incident',
        areaId: 'a1',
        architectures: ['AS-IS'],
      }),
    ).toEqual([{ id: 'p1' }]);
    expect(await processesRepository.listProcesses({})).toEqual([]);

    expect(await processesRepository.findPublicProcessBase('p1')).toEqual({
      id: 'p1',
    });
    expect(
      await processesRepository.findPublicProcessBase('missing'),
    ).toBeNull();

    expect(
      await processesRepository.findPublishedProcessVersion('p1', 'AS-IS'),
    ).toEqual({ id: 'v1' });
    expect(
      await processesRepository.findPublishedProcessVersion('p1', 'TO-BE'),
    ).toBeNull();

    expect(await processesRepository.listProcessVersions('p1')).toEqual([
      { id: 'v1' },
    ]);
    expect(await processesRepository.findPublishedBpmnAsset('v1')).toEqual({
      file_path: 'bpmn/p1.bpmn',
    });
    expect(
      await processesRepository.findPublishedBpmnAsset('missing'),
    ).toBeNull();
  });

  it('queries public procedures by filters, version, and id', async () => {
    query
      .mockResolvedValueOnce([{ id: 'pr1' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'pr1' }])
      .mockResolvedValueOnce([{ id: 'pr1' }])
      .mockResolvedValueOnce([]);

    expect(
      await proceduresRepository.listProcedures({ search: 'triage' }),
    ).toEqual([{ id: 'pr1' }]);
    expect(await proceduresRepository.listProcedures({})).toEqual([]);
    expect(
      await proceduresRepository.listPublishedProceduresByVersionId('v1'),
    ).toEqual([{ id: 'pr1' }]);
    expect(await proceduresRepository.findProcedureDetail('pr1')).toEqual({
      id: 'pr1',
    });
    expect(
      await proceduresRepository.findProcedureDetail('missing'),
    ).toBeNull();
  });

  it('rejects absolute, escaping, or missing BPMN asset paths', async () => {
    await expect(
      assetsService.readPublishedBpmnXml('/etc/passwd'),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      assetsService.readPublishedBpmnXml('../../package.json'),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      assetsService.readPublishedBpmnXml('non-existent-file.bpmn'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
