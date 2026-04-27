import {
  buildCatalogBreadcrumbs,
  buildProcedureBreadcrumbs,
  buildProcessBreadcrumbs,
} from './breadcrumbs.builder';

describe('breadcrumbs.builder', () => {
  it('should build collection breadcrumbs for the active catalog tab', () => {
    expect(buildCatalogBreadcrumbs('processes')).toEqual([
      { label: 'Home', link: '/' },
      { label: 'Processes' },
    ]);

    expect(buildCatalogBreadcrumbs('procedures')).toEqual([
      { label: 'Home', link: '/' },
      { label: 'Procedures' },
    ]);
  });

  it('should build process breadcrumbs with catalog routes and omit an overview leaf', () => {
    const detail = {
      process: {
        id: 'process-1',
        code: 'PR-001',
        title: 'Incident Management',
        description: null,
        area: {
          id: 'area-1',
          code: 'OPS',
          title: 'Operations',
        },
        itilPractice: {
          id: 'practice-1',
          code: 'SM',
          name: 'Service Management',
        },
      },
      versions: {
        asIs: null,
        toBe: null,
      },
    };

    expect(buildProcessBreadcrumbs(detail, 'Overview', 'as-is')).toEqual([
      { label: 'Home', link: '/' },
      { label: 'Processes', link: '/catalog/processes' },
      {
        label: 'Operations',
        link: '/catalog/processes',
        queryParams: { areaId: 'area-1' },
      },
      {
        label: 'PR-001 - Incident Management',
        link: '/catalog/processes/process-1',
        queryParams: { view: 'as-is' },
      },
    ]);
  });

  it('should build direct procedure breadcrumbs for collection browsing', () => {
    const detail = {
      procedure: {
        id: 'procedure-1',
        processVersionId: 'version-1',
        code: 'PROC-101',
        title: 'Escalate Incident',
        description: null,
        version: {
          versionNumber: 2,
          architectureState: 'TO-BE' as const,
          title: 'Target State',
        },
        process: {
          id: 'process-1',
          code: 'PR-001',
          title: 'Incident Management',
        },
        area: {
          id: 'area-1',
          code: 'OPS',
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
        versionNumber: 2,
        architectureState: 'TO-BE' as const,
        title: 'Target State',
      },
      process: {
        id: 'process-1',
        code: 'PR-001',
        title: 'Incident Management',
      },
      area: {
        id: 'area-1',
        code: 'OPS',
        title: 'Operations',
      },
      itilPractice: {
        id: 'practice-1',
        code: 'SM',
        name: 'Service Management',
      },
    };

    expect(buildProcedureBreadcrumbs(detail)).toEqual([
      { label: 'Home', link: '/' },
      { label: 'Procedures', link: '/catalog/procedures' },
      { label: 'PROC-101 - Escalate Incident' },
    ]);
  });

  it('should build process-origin procedure breadcrumbs with the process procedures context', () => {
    const detail = {
      procedure: {
        id: 'procedure-1',
        processVersionId: 'version-1',
        code: 'PROC-101',
        title: 'Escalate Incident',
        description: null,
        version: {
          versionNumber: 2,
          architectureState: 'TO-BE' as const,
          title: 'Target State',
        },
        process: {
          id: 'process-1',
          code: 'PR-001',
          title: 'Incident Management',
        },
        area: {
          id: 'area-1',
          code: 'OPS',
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
        versionNumber: 2,
        architectureState: 'TO-BE' as const,
        title: 'Target State',
      },
      process: {
        id: 'process-1',
        code: 'PR-001',
        title: 'Incident Management',
      },
      area: {
        id: 'area-1',
        code: 'OPS',
        title: 'Operations',
      },
      itilPractice: {
        id: 'practice-1',
        code: 'SM',
        name: 'Service Management',
      },
    };

    expect(
      buildProcedureBreadcrumbs(detail, {
        origin: 'process',
        originProcessId: 'process-1',
        view: 'to-be',
      }),
    ).toEqual([
      { label: 'Home', link: '/' },
      { label: 'Processes', link: '/catalog/processes' },
      {
        label: 'Operations',
        link: '/catalog/processes',
        queryParams: { areaId: 'area-1' },
      },
      {
        label: 'PR-001 - Incident Management',
        link: '/catalog/processes/process-1',
        queryParams: { tab: 'procedures', view: 'to-be' },
      },
      { label: 'PROC-101 - Escalate Incident' },
    ]);
  });

  it('should fall back to direct procedure breadcrumbs when the origin process does not match', () => {
    const detail = {
      procedure: {
        id: 'procedure-1',
        processVersionId: 'version-1',
        code: 'PROC-101',
        title: 'Escalate Incident',
        description: null,
        version: {
          versionNumber: 2,
          architectureState: 'TO-BE' as const,
          title: 'Target State',
        },
        process: {
          id: 'process-1',
          code: 'PR-001',
          title: 'Incident Management',
        },
        area: {
          id: 'area-1',
          code: 'OPS',
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
        versionNumber: 2,
        architectureState: 'TO-BE' as const,
        title: 'Target State',
      },
      process: {
        id: 'process-1',
        code: 'PR-001',
        title: 'Incident Management',
      },
      area: {
        id: 'area-1',
        code: 'OPS',
        title: 'Operations',
      },
      itilPractice: {
        id: 'practice-1',
        code: 'SM',
        name: 'Service Management',
      },
    };

    expect(
      buildProcedureBreadcrumbs(detail, {
        origin: 'process',
        originProcessId: 'process-2',
        view: 'to-be',
      }),
    ).toEqual([
      { label: 'Home', link: '/' },
      { label: 'Procedures', link: '/catalog/procedures' },
      { label: 'PROC-101 - Escalate Incident' },
    ]);
  });
});
