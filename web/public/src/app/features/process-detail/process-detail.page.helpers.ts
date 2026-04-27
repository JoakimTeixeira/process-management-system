import { Data, ParamMap } from '@angular/router';

import {
  PublicProcessDetail,
  PublicProcessVersionView,
} from '../../core/models/public-portal.models';
import { ProcessTabId } from '../../core/routing/process-route.helper';

export interface DetailTabDefinition {
  id: Exclude<ProcessTabId, 'default'>;
  label: string;
  badge?: string;
  disabled?: boolean;
}

export type ViewSelection = 'as-is' | 'to-be';

export function buildProcessDetailTabDefinitions(
  selectedViewVersion: PublicProcessVersionView | null,
  historyCount: number,
  versionOptionCount: number,
): DetailTabDefinition[] {
  return [
    { id: 'overview', label: 'Overview' },
    {
      id: 'diagram',
      label: 'Diagram',
      badge: selectedViewVersion?.bpmnAsset ? '1' : '0',
    },
    {
      id: 'procedures',
      label: 'Procedures',
      badge: selectedViewVersion ? String(selectedViewVersion.procedures.length) : '0',
    },
    {
      id: 'history',
      label: 'History',
      badge: String(historyCount),
    },
    {
      id: 'compare',
      label: 'Compare',
      badge: versionOptionCount > 1 ? String(versionOptionCount) : '0',
    },
  ];
}

export function getCurrentDetailTabId(activeTabId: ProcessTabId): Exclude<ProcessTabId, 'default'> {
  return activeTabId === 'default' ? 'overview' : activeTabId;
}

export function showsProcessViewSelector(tabId: Exclude<ProcessTabId, 'default'>): boolean {
  return tabId === 'overview' || tabId === 'diagram' || tabId === 'procedures';
}

export function buildProcessVersionOptions(
  detail: PublicProcessDetail | null,
): { id: ViewSelection; label: string }[] {
  const options: { id: ViewSelection; label: string }[] = [];

  if (detail?.versions.asIs) {
    options.push({
      id: 'as-is',
      label: `Current State (v${detail.versions.asIs.versionNumber})`,
    });
  }

  if (detail?.versions.toBe) {
    options.push({
      id: 'to-be',
      label: `Target State (v${detail.versions.toBe.versionNumber})`,
    });
  }

  return options;
}

export function getProcessVersionForView(
  detail: PublicProcessDetail | null,
  viewId: ViewSelection,
): PublicProcessVersionView | null {
  if (viewId === 'to-be') {
    return detail?.versions.toBe ?? detail?.versions.asIs ?? null;
  }

  return detail?.versions.asIs ?? detail?.versions.toBe ?? null;
}

export function getViewLabel(viewId: ViewSelection): string {
  return viewId === 'to-be' ? 'Target State' : 'Current State';
}

export function getCompareTitle(
  version: PublicProcessVersionView | null,
  fallbackLabel: string,
): string {
  return version?.title ?? fallbackLabel;
}

export function getCompareSubtitle(
  version: PublicProcessVersionView | null,
  fallbackLabel: string,
): string {
  return version ? `${fallbackLabel} | v${version.versionNumber}` : fallbackLabel;
}

export function countPublishedProcessProcedures(detail: PublicProcessDetail | null): number {
  if (!detail) {
    return 0;
  }

  return (
    (detail.versions.asIs?.procedures.length ?? 0) + (detail.versions.toBe?.procedures.length ?? 0)
  );
}

export function getPublishedProcessViewsSummary(detail: PublicProcessDetail | null): string {
  if (!detail) {
    return 'Unavailable';
  }

  const labels: string[] = [];

  if (detail.versions.asIs) {
    labels.push('Current State');
  }

  if (detail.versions.toBe) {
    labels.push('Target State');
  }

  return labels.length > 0 ? labels.join(' and ') : 'No published views';
}

export function formatProcessHistoryDate(value?: string): string {
  if (!value) {
    return 'Not recorded';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not recorded';
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function readProcessDetailTabId(data: Data, queryParams?: ParamMap): ProcessTabId {
  const queryTab = queryParams?.get('tab');

  if (
    queryTab === 'overview' ||
    queryTab === 'diagram' ||
    queryTab === 'procedures' ||
    queryTab === 'history' ||
    queryTab === 'compare'
  ) {
    return queryTab;
  }

  const value = data['tab'];

  if (
    value === 'overview' ||
    value === 'diagram' ||
    value === 'procedures' ||
    value === 'history' ||
    value === 'compare' ||
    value === 'default'
  ) {
    return value;
  }

  return 'default';
}

export function normalizeDetailViewSelection(
  value: string | null | undefined,
  fallback: ViewSelection = 'as-is',
): ViewSelection {
  return value === 'to-be' ? 'to-be' : fallback;
}

export function buildProcessDetailQueryParams(
  tabId: Exclude<ProcessTabId, 'default'>,
  selectedViewId: ViewSelection,
  compareLeftViewId: ViewSelection,
  compareRightViewId: ViewSelection,
): Record<string, string> | undefined {
  if (tabId === 'compare') {
    return {
      left: compareLeftViewId,
      right: compareRightViewId,
    };
  }

  if (tabId === 'history') {
    return undefined;
  }

  return { view: selectedViewId };
}

export function resolveAvailableProcessViews(
  detail: PublicProcessDetail | null,
  selectedViewId: ViewSelection,
  compareLeftViewId: ViewSelection,
  compareRightViewId: ViewSelection,
): {
  selectedViewId: ViewSelection;
  compareLeftViewId: ViewSelection;
  compareRightViewId: ViewSelection;
} {
  const availableViewIds = getAvailableProcessViewIds(detail);
  const nextSelectedViewId = resolveAvailableProcessView(availableViewIds, selectedViewId);

  if (availableViewIds.length <= 1) {
    const onlyViewId = availableViewIds[0] ?? 'as-is';
    return {
      selectedViewId: nextSelectedViewId,
      compareLeftViewId: onlyViewId,
      compareRightViewId: onlyViewId,
    };
  }

  const nextCompareLeftViewId = resolveAvailableProcessView(
    availableViewIds,
    compareLeftViewId,
    availableViewIds[0],
  );
  let nextCompareRightViewId = resolveAvailableProcessView(
    availableViewIds,
    compareRightViewId,
    availableViewIds[1],
  );

  if (nextCompareLeftViewId === nextCompareRightViewId) {
    nextCompareRightViewId = nextCompareLeftViewId === 'as-is' ? 'to-be' : 'as-is';
  }

  return {
    selectedViewId: nextSelectedViewId,
    compareLeftViewId: nextCompareLeftViewId,
    compareRightViewId: nextCompareRightViewId,
  };
}

export function getProcessTabLabel(tabId: Exclude<ProcessTabId, 'default'>): string {
  switch (tabId) {
    case 'diagram':
      return 'Diagram';
    case 'procedures':
      return 'Procedures';
    case 'history':
      return 'History';
    case 'compare':
      return 'Compare';
    case 'overview':
    default:
      return 'Overview';
  }
}

function getAvailableProcessViewIds(detail: PublicProcessDetail | null): ViewSelection[] {
  const viewIds: ViewSelection[] = [];

  if (detail?.versions.asIs) {
    viewIds.push('as-is');
  }

  if (detail?.versions.toBe) {
    viewIds.push('to-be');
  }

  return viewIds;
}

function resolveAvailableProcessView(
  availableViewIds: ViewSelection[],
  preferred: ViewSelection,
  fallback: ViewSelection = 'as-is',
): ViewSelection {
  if (availableViewIds.includes(preferred)) {
    return preferred;
  }

  if (availableViewIds.includes(fallback)) {
    return fallback;
  }

  return availableViewIds[0] ?? 'as-is';
}
