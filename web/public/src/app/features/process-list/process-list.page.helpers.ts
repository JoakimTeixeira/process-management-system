import {
  ArchitectureState,
  PublicAreaSummary,
  PublicProcessSummary,
  PublicProcedureSummary,
} from '../../core/models/public-portal.models';
import { CatalogTabId } from '../../core/ui/catalog-query-state';
import { getArchitectureLabel } from '../../core/ui/architecture-view.helpers';

export interface CatalogTabDefinition {
  id: CatalogTabId;
  label: string;
  badge: string;
}

export interface CatalogProcessOption {
  id: string;
  code: string;
  title: string;
}

export const CATALOG_ARCHITECTURE_OPTIONS = [
  { value: 'AS-IS' as const, label: getArchitectureLabel('AS-IS') },
  { value: 'TO-BE' as const, label: getArchitectureLabel('TO-BE') },
];

export function getCatalogRoute(tabId: CatalogTabId): string {
  return tabId === 'procedures' ? '/catalog/procedures' : '/catalog/processes';
}

export function getDefaultCatalogTab(value: unknown): CatalogTabId {
  return value === 'procedures' ? 'procedures' : 'processes';
}

export function getCatalogPageTitle(configuredTitle: unknown, activeTabId: CatalogTabId): string {
  if (
    typeof configuredTitle === 'string' &&
    configuredTitle.trim() !== '' &&
    configuredTitle.trim().toLowerCase() !== 'catalog'
  ) {
    return configuredTitle.trim();
  }

  return activeTabId === 'procedures' ? 'Procedures' : 'Processes';
}

export function getCatalogPageDescription(activeTabId: CatalogTabId): string {
  if (activeTabId === 'procedures') {
    return 'Explore published procedures, then narrow the list by area, process, keyword, or view.';
  }

  return 'Explore published processes, then narrow the list by area, keyword, or view.';
}

export function getDefaultProcessView(process: PublicProcessSummary): 'as-is' | 'to-be' {
  return process.availableArchitectures.includes('AS-IS') ? 'as-is' : 'to-be';
}

export function getProcedureArchitectureState(
  procedure: PublicProcedureSummary,
): ArchitectureState | null {
  return procedure.version?.architectureState ?? null;
}

export function getProcedureArchitectureLabel(procedure: PublicProcedureSummary): string {
  const architectureState = getProcedureArchitectureState(procedure);
  return architectureState ? getArchitectureLabel(architectureState) : 'View unavailable';
}

export function getProcedureVersionLabel(procedure: PublicProcedureSummary): string | null {
  const versionNumber = procedure.version?.versionNumber;
  return typeof versionNumber === 'number' ? `v${versionNumber}` : null;
}

export function getProcedureCountForProcess(
  processId: string,
  procedures: PublicProcedureSummary[],
): number {
  return procedures.filter((procedure) => procedure.process.id === processId).length;
}

export function getSelectedArea(
  areas: PublicAreaSummary[],
  selectedAreaId: string,
): PublicAreaSummary | null {
  return areas.find((area) => area.id === selectedAreaId) ?? null;
}

export function getSelectedAreaLabel(
  areas: PublicAreaSummary[],
  selectedAreaId: string,
): string | null {
  const selectedArea = getSelectedArea(areas, selectedAreaId);
  return selectedArea ? `${selectedArea.code} - ${selectedArea.title}` : null;
}

export function getSelectedProcessLabel(
  processOptions: CatalogProcessOption[],
  selectedProcessId: string,
): string | null {
  if (!selectedProcessId) {
    return null;
  }

  const selectedProcess = processOptions.find((candidate) => candidate.id === selectedProcessId);
  return selectedProcess ? `${selectedProcess.code} - ${selectedProcess.title}` : null;
}

export function buildProcessOptions(processes: PublicProcessSummary[]): CatalogProcessOption[] {
  return processes
    .map((process) => ({
      id: process.id,
      code: process.code,
      title: process.title,
    }))
    .sort((left, right) => left.title.localeCompare(right.title));
}

export function filterBaseProcesses(
  processes: PublicProcessSummary[],
  selectedAreaId: string,
  selectedArchitecture: ArchitectureState | '',
): PublicProcessSummary[] {
  return processes.filter((process) => {
    if (selectedAreaId && process.area.id !== selectedAreaId) {
      return false;
    }

    if (selectedArchitecture && !process.availableArchitectures.includes(selectedArchitecture)) {
      return false;
    }

    return true;
  });
}

export function filterBaseProcedures(
  procedures: PublicProcedureSummary[],
  selectedAreaId: string,
  selectedArchitecture: ArchitectureState | '',
  selectedProcessId: string,
): PublicProcedureSummary[] {
  return procedures.filter((procedure) => {
    const architectureState = getProcedureArchitectureState(procedure);

    if (selectedAreaId && procedure.area.id !== selectedAreaId) {
      return false;
    }

    if (selectedArchitecture && architectureState !== selectedArchitecture) {
      return false;
    }

    if (selectedProcessId && procedure.process.id !== selectedProcessId) {
      return false;
    }

    return true;
  });
}

export function filterProcesses(
  processes: PublicProcessSummary[],
  query: string,
): PublicProcessSummary[] {
  const normalizedQuery = query.trim().toLowerCase();

  return processes.filter((process) => {
    if (normalizedQuery === '') {
      return true;
    }

    const haystack = [
      process.code,
      process.title,
      process.description ?? '',
      process.area.code,
      process.area.title,
      process.itilPractice.code,
      process.itilPractice.name,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function filterProcedures(
  procedures: PublicProcedureSummary[],
  query: string,
): PublicProcedureSummary[] {
  const normalizedQuery = query.trim().toLowerCase();

  return procedures.filter((procedure) => {
    if (normalizedQuery === '') {
      return true;
    }

    const haystack = [
      procedure.code,
      procedure.title,
      procedure.description ?? '',
      procedure.process.code,
      procedure.process.title,
      procedure.area.code,
      procedure.area.title,
      procedure.utility,
      procedure.outcome,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function buildCatalogTabDefinitions(
  processCount: number,
  procedureCount: number,
): CatalogTabDefinition[] {
  return [
    { id: 'processes', label: 'Processes', badge: String(processCount) },
    { id: 'procedures', label: 'Procedures', badge: String(procedureCount) },
  ];
}

export function normalizeSelectedProcessId(
  activeTabId: CatalogTabId,
  selectedProcessId: string,
  processOptions: CatalogProcessOption[],
): string {
  if (activeTabId !== 'procedures' || !selectedProcessId) {
    return '';
  }

  const processStillVisible = processOptions.some((process) => process.id === selectedProcessId);
  return processStillVisible ? selectedProcessId : '';
}
