import { ParamMap, Params } from '@angular/router';

import { ArchitectureState } from '../models/public-portal.models';

export type CatalogTabId = 'processes' | 'procedures';

export interface CatalogQueryState {
  tab: CatalogTabId;
  search: string;
  areaId: string;
  architecture: ArchitectureState | '';
  processId: string;
}

export function readCatalogQueryState(
  queryParams: ParamMap,
  fallbackTab: CatalogTabId = 'processes',
): CatalogQueryState {
  return {
    tab: fallbackTab,
    search: queryParams.get('search')?.trim() ?? '',
    areaId: queryParams.get('areaId') ?? '',
    architecture: normalizeArchitectureFilter(queryParams.get('architecture')),
    processId: queryParams.get('processId') ?? '',
  };
}

export function buildCatalogQueryParams(state: CatalogQueryState): Params {
  return {
    search: state.search || null,
    areaId: state.areaId || null,
    architecture: state.architecture || null,
    processId: state.tab === 'procedures' && state.processId ? state.processId : null,
    tab: null,
  };
}

export function normalizeCatalogTab(
  value: string | null | undefined,
  fallbackTab: CatalogTabId = 'processes',
): CatalogTabId {
  if (value === 'procedures') {
    return 'procedures';
  }

  return fallbackTab;
}

export function normalizeArchitectureFilter(
  value: string | null | undefined,
): ArchitectureState | '' {
  if (value === 'AS-IS' || value === 'TO-BE') {
    return value;
  }

  return '';
}
