import { NotFoundException } from '@nestjs/common';

import { PublicCatalogRepository } from './public-catalog.repository';
import { PublicPortalAssetsService } from './public-portal-assets.service';
import { PublicProcessesRepository } from './public-processes.repository';
import { PublicProceduresRepository } from './public-procedures.repository';
import { PublicPortalService } from './public-portal.service';

describe('PublicPortalService', () => {
  let service: PublicPortalService;
  let catalogRepository: jest.Mocked<PublicCatalogRepository>;
  let processesRepository: jest.Mocked<PublicProcessesRepository>;
  let proceduresRepository: jest.Mocked<PublicProceduresRepository>;
  let assetsService: jest.Mocked<PublicPortalAssetsService>;

  beforeEach(() => {
    catalogRepository = {
      listAreas: jest.fn(),
      searchCatalog: jest.fn(),
    } as unknown as jest.Mocked<PublicCatalogRepository>;

    processesRepository = {
      listProcesses: jest.fn(),
      findPublicProcessBase: jest.fn(),
      findPublishedProcessVersion: jest.fn(),
      listProcessVersions: jest.fn(),
      findPublishedBpmnAsset: jest.fn(),
    } as unknown as jest.Mocked<PublicProcessesRepository>;

    proceduresRepository = {
      listProcedures: jest.fn(),
      listPublishedProceduresByVersionId: jest.fn(),
      findProcedureDetail: jest.fn(),
    } as unknown as jest.Mocked<PublicProceduresRepository>;

    assetsService = {
      readPublishedBpmnXml: jest.fn(),
    } as unknown as jest.Mocked<PublicPortalAssetsService>;

    service = new PublicPortalService(
      catalogRepository,
      processesRepository,
      proceduresRepository,
      assetsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list public areas', async () => {
    catalogRepository.listAreas.mockResolvedValue([
      { id: 'area-1', code: 'AREA_OPS', title: 'Operations' },
    ]);

    await expect(service.listAreas()).resolves.toEqual([
      { id: 'area-1', code: 'AREA_OPS', title: 'Operations' },
    ]);
  });

  it('should map public process summaries and forward filters', async () => {
    processesRepository.listProcesses.mockResolvedValue([
      {
        id: 'process-1',
        code: 'PROC_CHANGE',
        title: 'Change management',
        description: 'Public change process',
        area_id: 'area-1',
        area_code: 'AREA_OPS',
        area_title: 'Operations',
        practice_id: 'practice-1',
        practice_code: 'CHANGE_ENABLEMENT',
        practice_name: 'Change enablement',
        available_architectures: ['AS-IS', 'TO-BE'],
      },
    ]);

    await expect(
      service.listProcesses({
        search: ' Change ',
        areaId: 'area-1',
        architectures: ['AS-IS', 'TO-BE'],
      }),
    ).resolves.toEqual([
      {
        id: 'process-1',
        code: 'PROC_CHANGE',
        title: 'Change management',
        description: 'Public change process',
        area: {
          id: 'area-1',
          code: 'AREA_OPS',
          title: 'Operations',
        },
        itilPractice: {
          id: 'practice-1',
          code: 'CHANGE_ENABLEMENT',
          name: 'Change enablement',
        },
        availableArchitectures: ['AS-IS', 'TO-BE'],
      },
    ]);

    expect(processesRepository.listProcesses.mock.calls[0]?.[0]).toEqual({
      search: ' Change ',
      areaId: 'area-1',
      architectures: ['AS-IS', 'TO-BE'],
    });
  });

  it('should return an empty catalog result for blank search terms', async () => {
    await expect(service.searchCatalog({ search: '   ' })).resolves.toEqual([]);
    expect(catalogRepository.searchCatalog.mock.calls).toHaveLength(0);
  });

  it('should search the published catalog and trim the search term', async () => {
    catalogRepository.searchCatalog.mockResolvedValue([
      {
        kind: 'Area',
        code: 'AREA_OPS',
        title: 'Operations',
        subtitle: 'Area',
        href: '/catalog/processes?areaId=area-1',
        sort_kind: 1,
        sort_title: 'Operations',
        similarity_score: 1,
      },
    ]);

    await expect(
      service.searchCatalog({ search: ' operations ' }),
    ).resolves.toEqual([
      {
        kind: 'Area',
        code: 'AREA_OPS',
        title: 'Operations',
        subtitle: 'Area',
        href: '/catalog/processes?areaId=area-1',
      },
    ]);

    expect(catalogRepository.searchCatalog.mock.calls[0]).toEqual([
      'operations',
    ]);
  });

  it('should map public procedures from repository rows', async () => {
    proceduresRepository.listProcedures.mockResolvedValue([
      {
        id: 'procedure-1',
        process_version_id: 'version-1',
        code: 'PROC_STEP',
        title: 'Review change',
        utility: 'Utility',
        warranty: 'Warranty',
        outcome: 'Outcome',
        policy: 'Policy',
        activities: [{ step: 'review' }],
        inputs: ['request'],
        outputs: ['decision'],
        process_id: 'process-1',
        process_code: 'PROC_CHANGE',
        process_title: 'Change management',
        area_id: 'area-1',
        area_code: 'AREA_OPS',
        area_title: 'Operations',
        practice_id: 'practice-1',
        practice_code: 'CHANGE_ENABLEMENT',
        practice_name: 'Change enablement',
        version_number: 3,
        architecture_state: 'TO-BE',
        version_title: 'Target view',
      },
    ]);

    await expect(service.listProcedures({ search: 'review' })).resolves.toEqual(
      [
        {
          id: 'procedure-1',
          processVersionId: 'version-1',
          code: 'PROC_STEP',
          title: 'Review change',
          description: null,
          version: {
            versionNumber: 3,
            architectureState: 'TO-BE',
            title: 'Target view',
          },
          process: {
            id: 'process-1',
            code: 'PROC_CHANGE',
            title: 'Change management',
          },
          area: {
            id: 'area-1',
            code: 'AREA_OPS',
            title: 'Operations',
          },
          utility: 'Utility',
          warranty: 'Warranty',
          outcome: 'Outcome',
          policy: 'Policy',
          activities: [{ step: 'review' }],
          inputs: ['request'],
          outputs: ['decision'],
        },
      ],
    );
  });

  it('should return process detail with hydrated version procedures', async () => {
    processesRepository.findPublicProcessBase.mockResolvedValue({
      id: 'process-1',
      code: 'PROC_CHANGE',
      title: 'Change management',
      description: null,
      area_id: 'area-1',
      area_code: 'AREA_OPS',
      area_title: 'Operations',
      practice_id: 'practice-1',
      practice_code: 'CHANGE_ENABLEMENT',
      practice_name: 'Change enablement',
      available_architectures: ['AS-IS'],
    });
    processesRepository.findPublishedProcessVersion
      .mockResolvedValueOnce({
        id: 'version-1',
        process_id: 'process-1',
        version_number: 1,
        architecture_state: 'AS-IS',
        title: 'Current flow',
        change_description: 'Published baseline',
        reason_for_change: 'Initial publication',
        asset_id: 'asset-1',
        asset_caption: 'Main BPMN',
      })
      .mockResolvedValueOnce(null);
    proceduresRepository.listPublishedProceduresByVersionId.mockResolvedValue([
      {
        id: 'procedure-1',
        process_version_id: 'version-1',
        code: 'PROC_STEP',
        title: 'Review change',
        utility: 'Utility',
        warranty: 'Warranty',
        outcome: 'Outcome',
        policy: 'Policy',
        activities: [],
        inputs: [],
        outputs: [],
        process_id: 'process-1',
        process_code: 'PROC_CHANGE',
        process_title: 'Change management',
        area_id: 'area-1',
        area_code: 'AREA_OPS',
        area_title: 'Operations',
        practice_id: 'practice-1',
        practice_code: 'CHANGE_ENABLEMENT',
        practice_name: 'Change enablement',
        version_number: 1,
        architecture_state: 'AS-IS',
        version_title: 'Current flow',
      },
    ]);

    await expect(service.getProcessDetail('process-1')).resolves.toEqual({
      process: {
        id: 'process-1',
        code: 'PROC_CHANGE',
        title: 'Change management',
        description: null,
        area: { id: 'area-1', code: 'AREA_OPS', title: 'Operations' },
        itilPractice: {
          id: 'practice-1',
          code: 'CHANGE_ENABLEMENT',
          name: 'Change enablement',
        },
      },
      versions: {
        asIs: {
          id: 'version-1',
          processId: 'process-1',
          versionNumber: 1,
          architectureState: 'AS-IS',
          title: 'Current flow',
          changeDescription: 'Published baseline',
          reasonForChange: 'Initial publication',
          procedures: [
            {
              id: 'procedure-1',
              processVersionId: 'version-1',
              code: 'PROC_STEP',
              title: 'Review change',
              description: null,
              version: {
                versionNumber: 1,
                architectureState: 'AS-IS',
                title: 'Current flow',
              },
              process: {
                id: 'process-1',
                code: 'PROC_CHANGE',
                title: 'Change management',
              },
              area: {
                id: 'area-1',
                code: 'AREA_OPS',
                title: 'Operations',
              },
              utility: 'Utility',
              warranty: 'Warranty',
              outcome: 'Outcome',
              policy: 'Policy',
              activities: [],
              inputs: [],
              outputs: [],
            },
          ],
          bpmnAsset: {
            id: 'asset-1',
            caption: 'Main BPMN',
          },
        },
        toBe: null,
      },
    });
  });

  it('should return metadata-only public version history for published processes', async () => {
    processesRepository.findPublicProcessBase.mockResolvedValue({
      id: 'process-1',
      code: 'PROC_CHANGE',
      title: 'Change management',
      description: null,
      area_id: 'area-1',
      area_code: 'AREA_OPS',
      area_title: 'Operations',
      practice_id: 'practice-1',
      practice_code: 'CHANGE_ENABLEMENT',
      practice_name: 'Change enablement',
      available_architectures: ['AS-IS'],
    });
    processesRepository.listProcessVersions.mockResolvedValue([
      {
        id: 'version-2',
        version_number: 2,
        lifecycle_state: 'Archived',
        architecture_state: 'AS-IS',
        title: 'Previous baseline',
        change_description: 'Older view',
        reason_for_change: 'Historical record',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-10T00:00:00.000Z',
        derived_from_version_id: 'version-1',
      },
    ]);

    await expect(service.listProcessVersions('process-1')).resolves.toEqual([
      {
        id: 'version-2',
        versionNumber: 2,
        lifecycleState: 'Archived',
        architectureState: 'AS-IS',
        title: 'Previous baseline',
        changeDescription: 'Older view',
        reasonForChange: 'Historical record',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-10T00:00:00.000Z',
        derivedFromVersionId: 'version-1',
      },
    ]);
  });

  it('should return published bpmn xml only when a published asset exists', async () => {
    processesRepository.findPublishedBpmnAsset.mockResolvedValue({
      file_path: 'diagrams/change.bpmn',
    });
    assetsService.readPublishedBpmnXml.mockResolvedValue('<definitions />');

    await expect(service.getPublishedBpmnXml('version-1')).resolves.toBe(
      '<definitions />',
    );

    expect(assetsService.readPublishedBpmnXml.mock.calls[0]).toEqual([
      'diagrams/change.bpmn',
    ]);
  });

  it('should reject bpmn access when no published asset is available', async () => {
    processesRepository.findPublishedBpmnAsset.mockResolvedValue(null);

    await expect(
      service.getPublishedBpmnXml('version-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should return public procedure detail only for published procedures', async () => {
    proceduresRepository.findProcedureDetail.mockResolvedValue({
      id: 'procedure-1',
      process_version_id: 'version-1',
      code: 'PROC_STEP',
      title: 'Review change',
      utility: 'Utility',
      warranty: 'Warranty',
      outcome: 'Outcome',
      policy: 'Policy',
      activities: [{ step: 'review' }],
      inputs: ['request'],
      outputs: ['decision'],
      process_id: 'process-1',
      process_code: 'PROC_CHANGE',
      process_title: 'Change management',
      area_id: 'area-1',
      area_code: 'AREA_OPS',
      area_title: 'Operations',
      practice_id: 'practice-1',
      practice_code: 'CHANGE_ENABLEMENT',
      practice_name: 'Change enablement',
      version_number: 3,
      architecture_state: 'TO-BE',
      version_title: 'Target view',
    });

    await expect(service.getProcedureDetail('procedure-1')).resolves.toEqual({
      procedure: {
        id: 'procedure-1',
        processVersionId: 'version-1',
        code: 'PROC_STEP',
        title: 'Review change',
        description: null,
        version: {
          versionNumber: 3,
          architectureState: 'TO-BE',
          title: 'Target view',
        },
        process: {
          id: 'process-1',
          code: 'PROC_CHANGE',
          title: 'Change management',
        },
        area: {
          id: 'area-1',
          code: 'AREA_OPS',
          title: 'Operations',
        },
        utility: 'Utility',
        warranty: 'Warranty',
        outcome: 'Outcome',
        policy: 'Policy',
        activities: [{ step: 'review' }],
        inputs: ['request'],
        outputs: ['decision'],
      },
      version: {
        id: 'version-1',
        versionNumber: 3,
        architectureState: 'TO-BE',
        title: 'Target view',
      },
      process: {
        id: 'process-1',
        code: 'PROC_CHANGE',
        title: 'Change management',
      },
      area: {
        id: 'area-1',
        code: 'AREA_OPS',
        title: 'Operations',
      },
      itilPractice: {
        id: 'practice-1',
        code: 'CHANGE_ENABLEMENT',
        name: 'Change enablement',
      },
    });
  });
});
