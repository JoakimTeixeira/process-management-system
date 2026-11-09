import {
  PublicAreaSummary,
  PublicProcedureSummary,
  PublicProcessSummary,
} from '../../core/models/public-portal.models';
import {
  buildCatalogTabDefinitions,
  buildProcessOptions,
  CATALOG_ARCHITECTURE_OPTIONS,
  filterBaseProcedures,
  filterBaseProcesses,
  filterProcedures,
  filterProcesses,
  getCatalogPageDescription,
  getCatalogPageTitle,
  getDefaultCatalogTab,
  getDefaultProcessView,
  getProcedureArchitectureLabel,
  getProcedureArchitectureState,
  getProcedureCountForProcess,
  getProcedureVersionLabel,
  getSelectedArea,
  getSelectedAreaLabel,
  getSelectedProcessLabel,
  normalizeSelectedProcessId,
} from './process-list.page.helpers';

describe('process-list.page.helpers', () => {
  const area: PublicAreaSummary = {
    id: 'a1',
    code: 'A1',
    title: 'Service Operation',
  };

  const processAsIs: PublicProcessSummary = {
    id: 'p1',
    code: '1',
    title: 'Incident Management',
    description: 'Restore service',
    area,
    itilPractice: { id: 'ip1', code: 'IM', name: 'Incident Management' },
    availableArchitectures: ['AS-IS'],
  };

  const processToBe: PublicProcessSummary = {
    ...processAsIs,
    id: 'p2',
    code: '2',
    title: 'Access Control',
    description: null,
    availableArchitectures: ['TO-BE'],
  };

  const procedureWithVersion: PublicProcedureSummary = {
    id: 'pr1',
    processVersionId: 'v1',
    code: '1.1',
    title: 'Register Ticket',
    description: 'Capture ticket details',
    version: { versionNumber: 3, architectureState: 'AS-IS', title: 'v3' },
    process: { id: 'p1', code: '1', title: 'Incident Management' },
    area,
    utility: 'Fast triage',
    warranty: 'Always available',
    outcome: 'Ticket logged',
    policy: 'Mandatory logging',
    activities: [],
    inputs: [],
    outputs: [],
  };

  const procedureWithoutVersion: PublicProcedureSummary = {
    ...procedureWithVersion,
    id: 'pr2',
    code: '2.1',
    title: 'Grant Role',
    description: null,
    utility: 'Role provisioning',
    version: undefined as unknown as PublicProcedureSummary['version'],
    process: { id: 'p2', code: '2', title: 'Access Control' },
  };

  it('should resolve catalog tabs, page titles, and descriptions', () => {
    expect(CATALOG_ARCHITECTURE_OPTIONS).toHaveLength(2);
    expect(getDefaultCatalogTab('procedures')).toBe('procedures');
    expect(getDefaultCatalogTab('other')).toBe('processes');

    expect(getCatalogPageTitle('Custom Title', 'processes')).toBe('Custom Title');
    expect(getCatalogPageTitle('Catalog', 'processes')).toBe('Processes');
    expect(getCatalogPageTitle('', 'procedures')).toBe('Procedures');

    expect(getCatalogPageDescription('processes')).toContain('published processes');
    expect(getCatalogPageDescription('procedures')).toContain('published procedures');
  });

  it('should compute process and procedure view and version labels', () => {
    expect(getDefaultProcessView(processAsIs)).toBe('as-is');
    expect(getDefaultProcessView(processToBe)).toBe('to-be');

    expect(getProcedureArchitectureState(procedureWithVersion)).toBe('AS-IS');
    expect(getProcedureArchitectureState(procedureWithoutVersion)).toBeNull();

    expect(getProcedureArchitectureLabel(procedureWithVersion)).toBe('Current State');
    expect(getProcedureArchitectureLabel(procedureWithoutVersion)).toBe('View unavailable');

    expect(getProcedureVersionLabel(procedureWithVersion)).toBe('v3');
    expect(getProcedureVersionLabel(procedureWithoutVersion)).toBeNull();

    expect(
      getProcedureCountForProcess('p1', [procedureWithVersion, procedureWithoutVersion]),
    ).toBe(1);
  });

  it('should resolve selected area and process labels and sort process options', () => {
    expect(getSelectedArea([area], 'a1')).toEqual(area);
    expect(getSelectedArea([area], 'missing')).toBeNull();

    expect(getSelectedAreaLabel([area], 'a1')).toBe('A1 - Service Operation');
    expect(getSelectedAreaLabel([area], 'missing')).toBeNull();

    const options = buildProcessOptions([processAsIs, processToBe]);
    expect(options.map((option) => option.title)).toEqual([
      'Access Control',
      'Incident Management',
    ]);

    expect(getSelectedProcessLabel(options, '')).toBeNull();
    expect(getSelectedProcessLabel(options, 'p1')).toBe('1 - Incident Management');
    expect(getSelectedProcessLabel(options, 'missing')).toBeNull();
  });

  it('should filter processes and procedures by area, architecture, process, and query', () => {
    const processes = [processAsIs, processToBe];
    expect(filterBaseProcesses(processes, 'other-area', '')).toEqual([]);
    expect(filterBaseProcesses(processes, 'a1', 'TO-BE')).toEqual([processToBe]);

    expect(filterProcesses(processes, '')).toHaveLength(2);
    expect(filterProcesses(processes, 'restore')).toEqual([processAsIs]);

    const procedures = [procedureWithVersion, procedureWithoutVersion];
    expect(filterBaseProcedures(procedures, 'other-area', '', '')).toEqual([]);
    expect(filterBaseProcedures(procedures, 'a1', 'AS-IS', '')).toEqual([procedureWithVersion]);
    expect(filterBaseProcedures(procedures, 'a1', '', 'p2')).toEqual([procedureWithoutVersion]);

    expect(filterProcedures(procedures, '')).toHaveLength(2);
    expect(filterProcedures(procedures, 'triage')).toEqual([procedureWithVersion]);
  });

  it('should build catalog tab definitions and normalize selected process IDs', () => {
    expect(buildCatalogTabDefinitions(4, 9)).toEqual([
      { id: 'processes', label: 'Processes', badge: '4' },
      { id: 'procedures', label: 'Procedures', badge: '9' },
    ]);

    const options = buildProcessOptions([processAsIs]);
    expect(normalizeSelectedProcessId('processes', 'p1', options)).toBe('');
    expect(normalizeSelectedProcessId('procedures', '', options)).toBe('');
    expect(normalizeSelectedProcessId('procedures', 'p1', options)).toBe('p1');
    expect(normalizeSelectedProcessId('procedures', 'missing', options)).toBe('');
  });
});

