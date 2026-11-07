import { ArchitectureState, PublicCatalogSearchResult } from '../models/public-portal.models';
import { getArchitectureViewId } from '../ui/architecture-view.helpers';

export type ProcessTabId =
  | 'default'
  | 'overview'
  | 'diagram'
  | 'procedures'
  | 'history'
  | 'compare';

export type CatalogRouteTab = 'processes' | 'procedures';

export interface CatalogNavigationTarget {
  routePath: string;
  routeSegments: string[];
  queryParams?: Record<string, string>;
}

const PROCESS_TAB_ORDER: ProcessTabId[] = [
  'overview',
  'diagram',
  'procedures',
  'history',
  'compare',
];

export function getProcessTabIdFromUrl(url: string): ProcessTabId {
  if (url.endsWith('/overview')) {
    return 'overview';
  }

  if (url.endsWith('/diagram')) {
    return 'diagram';
  }

  if (url.endsWith('/procedures')) {
    return 'procedures';
  }

  if (url.endsWith('/history')) {
    return 'history';
  }

  if (url.endsWith('/compare')) {
    return 'compare';
  }

  return 'default';
}

export function getProcessTabIndex(tabId: ProcessTabId): number {
  const normalizedTabId = tabId === 'default' ? 'overview' : tabId;
  const index = PROCESS_TAB_ORDER.indexOf(normalizedTabId);

  return index >= 0 ? index : 0;
}

export function getProcessTabIdFromIndex(index: number): ProcessTabId {
  return PROCESS_TAB_ORDER[index] ?? 'overview';
}

export function getProcessTabRoute(processId: string, tabId: ProcessTabId): string {
  switch (tabId) {
    case 'diagram':
      return `/catalog/processes/${processId}/diagram`;
    case 'procedures':
      return `/catalog/processes/${processId}/procedures`;
    case 'history':
      return `/catalog/processes/${processId}/history`;
    case 'compare':
      return `/catalog/processes/${processId}/compare`;
    case 'overview':
    case 'default':
    default:
      return `/catalog/processes/${processId}`;
  }
}

export function getCatalogRoute(tabId: CatalogRouteTab): string {
  return tabId === 'procedures' ? '/catalog/procedures' : '/catalog/processes';
}

export function getArchitectureRouteSegment(
  architectureState: ArchitectureState,
): 'as-is' | 'to-be' {
  return getArchitectureViewId(architectureState);
}

export function normalizeCatalogSearchHref(
  kind: PublicCatalogSearchResult['kind'],
  href: string,
): string {
  const [path, query = ''] = href.split('?');

  if (path === '/processes' && query.includes('areaId=')) {
    return `${getCatalogRoute('processes')}?${query}`;
  }

  if (path === '/procedures' && query === '') {
    return getCatalogRoute('procedures');
  }

  const procedureDetailMatch = path.match(/^\/procedures\/([^/]+)$/i);

  if (procedureDetailMatch) {
    return `${getCatalogRoute('procedures')}/${procedureDetailMatch[1]}`;
  }

  const processViewMatch = path.match(/^\/processes\/([^/]+)\/(as-is|to-be)$/i);

  if (processViewMatch) {
    const [, processId, view] = processViewMatch;
    const tabId: ProcessTabId = kind === 'Asset' ? 'diagram' : 'overview';
    return `${getProcessTabRoute(processId, tabId)}?view=${view.toLowerCase()}`;
  }

  const diagramViewMatch = path.match(/^\/processes\/([^/]+)\/diagram\/(as-is|to-be)$/i);

  if (diagramViewMatch) {
    const [, processId, view] = diagramViewMatch;
    return `${getProcessTabRoute(processId, 'diagram')}?view=${view.toLowerCase()}`;
  }

  const processOverviewMatch = path.match(/^\/processes\/([^/]+)\/overview$/i);

  if (processOverviewMatch) {
    return appendQuery(getProcessTabRoute(processOverviewMatch[1], 'overview'), query);
  }

  const processDetailMatch = path.match(/^\/processes\/([^/]+)$/i);

  if (processDetailMatch) {
    return appendQuery(getProcessTabRoute(processDetailMatch[1], 'overview'), query);
  }

  return href;
}

export function parseCatalogNavigationTarget(href: string): CatalogNavigationTarget {
  const parsedUrl = new URL(href, 'https://process-portal.local');
  const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());
  const segments = parsedUrl.pathname.split('/').filter(Boolean);

  return {
    routePath: parsedUrl.pathname,
    routeSegments: segments.length === 0 ? ['/'] : [`/${segments[0]}`, ...segments.slice(1)],
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  };
}

export function serializeCatalogNavigationTarget(
  routePath: string,
  queryParams?: Record<string, string>,
): string {
  if (!queryParams) {
    return routePath;
  }

  const query = new URLSearchParams(queryParams).toString();
  return query === '' ? routePath : `${routePath}?${query}`;
}

function appendQuery(routePath: string, query: string): string {
  return query === '' ? routePath : `${routePath}?${query}`;
}
