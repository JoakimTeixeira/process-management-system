import { Params } from '@angular/router';

import { PublicProcessDetail, PublicProcedureDetail } from '../../core/models/public-portal.models';
import { getProcessTabRoute } from '../../core/routing/process-route.helper';
import { CatalogTabId } from '../../core/ui/catalog-query-state';

export interface BreadcrumbItem {
  label: string;
  link?: string;
  queryParams?: Params;
}

export interface ProcedureBreadcrumbContext {
  origin: 'direct' | 'process';
  originProcessId?: string;
  view?: 'as-is' | 'to-be';
}

export function buildCatalogBreadcrumbs(tabId: CatalogTabId): BreadcrumbItem[] {
  return [
    { label: 'Home', link: '/' },
    { label: tabId === 'procedures' ? 'Procedures' : 'Processes' },
  ];
}

export function buildProcessBreadcrumbs(
  detail: PublicProcessDetail,
  currentTabLabel: string,
  selectedViewId: 'as-is' | 'to-be',
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Processes', link: '/catalog/processes' },
    {
      label: detail.process.area.title,
      link: '/catalog/processes',
      queryParams: { areaId: detail.process.area.id },
    },
    {
      label: formatCatalogLabel(detail.process.code, detail.process.title),
      link: getProcessTabRoute(detail.process.id, 'overview'),
      queryParams: { view: selectedViewId },
    },
  ];

  if (currentTabLabel !== 'Overview') {
    breadcrumbs.push({ label: currentTabLabel });
  }

  return breadcrumbs;
}

export function buildProcedureBreadcrumbs(
  detail: PublicProcedureDetail,
  context: ProcedureBreadcrumbContext = { origin: 'direct' },
): BreadcrumbItem[] {
  const procedureLabel = formatCatalogLabel(detail.procedure.code, detail.procedure.title);
  const resolvedView =
    context.view ?? (detail.version.architectureState === 'TO-BE' ? 'to-be' : 'as-is');

  if (
    context.origin !== 'process' ||
    !context.originProcessId ||
    context.originProcessId !== detail.process.id
  ) {
    return [
      { label: 'Home', link: '/' },
      { label: 'Procedures', link: '/catalog/procedures' },
      { label: procedureLabel },
    ];
  }

  return [
    { label: 'Home', link: '/' },
    { label: 'Processes', link: '/catalog/processes' },
    {
      label: detail.area.title,
      link: '/catalog/processes',
      queryParams: { areaId: detail.area.id },
    },
    {
      label: formatCatalogLabel(detail.process.code, detail.process.title),
      link: `/catalog/processes/${context.originProcessId}`,
      queryParams: {
        tab: 'procedures',
        view: resolvedView,
      },
    },
    { label: procedureLabel },
  ];
}

export function buildStaticBreadcrumbs(label: string): BreadcrumbItem[] {
  return [{ label: 'Home', link: '/' }, { label }];
}

function formatCatalogLabel(code: string | null | undefined, title: string): string {
  const normalizedCode = typeof code === 'string' ? code.trim() : '';
  return normalizedCode === '' ? title : `${normalizedCode} - ${title}`;
}
