import { ArchitectureState } from '../models/public-portal.models';

export type ProcessTabId =
  | 'default'
  | 'overview'
  | 'diagram'
  | 'procedures'
  | 'history'
  | 'compare';

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

export function getArchitectureRouteSegment(
  architectureState: ArchitectureState,
): 'as-is' | 'to-be' {
  return architectureState === 'AS-IS' ? 'as-is' : 'to-be';
}
