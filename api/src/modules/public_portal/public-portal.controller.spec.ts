import type { Mocked } from 'vitest';

import { GUARDS_METADATA } from '@nestjs/common/constants';

import { PublicPortalController } from './public-portal.controller';
import { PublicPortalService } from './public-portal.service';
import type {
  PublicAreaSummary,
  PublicCatalogSearchResult,
  PublicProcessDetail,
  PublicProcessHistoryItem,
  PublicProcessSummary,
  PublicProcedureDetail,
} from './public-portal.types';

describe('PublicPortalController metadata', () => {
  it('should not apply backoffice auth guards to public endpoints', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, PublicPortalController),
    ).toBeUndefined();
  });
});

describe('PublicPortalController', () => {
  let controller: PublicPortalController;
  let service: Mocked<
    Pick<
      PublicPortalService,
      | 'listAreas'
      | 'listProcesses'
      | 'searchCatalog'
      | 'getProcessDetail'
      | 'listProcessVersions'
      | 'getPublishedBpmnXml'
      | 'getProcedureDetail'
    >
  >;

  beforeEach(() => {
    service = {
      listAreas: vi.fn(),
      listProcesses: vi.fn(),
      searchCatalog: vi.fn(),
      getProcessDetail: vi.fn(),
      listProcessVersions: vi.fn(),
      getPublishedBpmnXml: vi.fn(),
      getProcedureDetail: vi.fn(),
    };

    controller = new PublicPortalController(
      service as unknown as PublicPortalService,
    );
  });

  it('should return public areas', async () => {
    const areas: PublicAreaSummary[] = [
      { id: 'area-1', code: 'AREA_OPS', title: 'Operations' },
    ];
    service.listAreas.mockResolvedValue(areas);

    await expect(controller.listAreas()).resolves.toEqual(areas);
  });

  it('should parse architecture filters for the public catalog', async () => {
    const processes: PublicProcessSummary[] = [];
    service.listProcesses.mockResolvedValue(processes);

    await expect(
      controller.listProcesses(
        ' change ',
        'area-1',
        'AS-IS,TO-BE,INVALID,AS-IS',
      ),
    ).resolves.toEqual(processes);

    expect(service.listProcesses).toHaveBeenCalledWith({
      search: ' change ',
      areaId: 'area-1',
      architectures: ['AS-IS', 'TO-BE'],
    });
  });

  it('should return mixed catalog search results', async () => {
    const results: PublicCatalogSearchResult[] = [
      {
        kind: 'Area',
        code: 'AREA_OPS',
        title: 'Operations',
        subtitle: 'Area',
        href: '/catalog/processes?areaId=area-1',
      },
    ];
    service.searchCatalog.mockResolvedValue(results);

    await expect(controller.searchCatalog(' operations ')).resolves.toEqual(
      results,
    );
    expect(service.searchCatalog).toHaveBeenCalledWith({
      search: ' operations ',
    });
  });

  it('should return process detail, history, bpmn xml, and procedure detail', async () => {
    const detail = {
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
        asIs: null,
        toBe: null,
      },
    } satisfies PublicProcessDetail;
    const history: PublicProcessHistoryItem[] = [];
    const procedure = {
      procedure: {
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
      version: {
        id: 'version-1',
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
      itilPractice: {
        id: 'practice-1',
        code: 'CHANGE_ENABLEMENT',
        name: 'Change enablement',
      },
    } satisfies PublicProcedureDetail;

    service.getProcessDetail.mockResolvedValue(detail);
    service.listProcessVersions.mockResolvedValue(history);
    service.getPublishedBpmnXml.mockResolvedValue('<xml />');
    service.getProcedureDetail.mockResolvedValue(procedure);

    await expect(
      controller.getProcessDetail({ processId: 'process-1' }),
    ).resolves.toEqual(detail);
    await expect(
      controller.listProcessVersions({ processId: 'process-1' }),
    ).resolves.toEqual(history);
    await expect(
      controller.getPublishedBpmnXml({ id: 'version-1' }),
    ).resolves.toBe('<xml />');
    await expect(
      controller.getProcedureDetail({ id: 'procedure-1' }),
    ).resolves.toEqual(procedure);
  });
});
