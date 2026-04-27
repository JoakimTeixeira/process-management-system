import { Routes } from '@angular/router';

import { FaqPageComponent } from './features/faq/faq.page';
import { GlossaryPageComponent } from './features/glossary/glossary.page';
import { HomePageComponent } from './features/home/home.page';
import { MethodologyPageComponent } from './features/methodology/methodology.page';
import { ProcedureDetailPageComponent } from './features/procedure-detail/procedure-detail.page';
import { ProcessDetailPageComponent } from './features/process-detail/process-detail.page';
import { ProcessListPageComponent } from './features/process-list/process-list.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'catalog',
    redirectTo: 'catalog/processes',
    pathMatch: 'full',
  },
  {
    path: 'catalog/processes',
    component: ProcessListPageComponent,
    data: { defaultCatalogTab: 'processes', pageTitle: 'Processes' },
  },
  {
    path: 'catalog/procedures',
    component: ProcessListPageComponent,
    data: { defaultCatalogTab: 'procedures', pageTitle: 'Procedures' },
  },
  {
    path: 'catalog/processes/:processId',
    component: ProcessDetailPageComponent,
    data: { tab: 'default' },
  },
  {
    path: 'catalog/processes/:processId/overview',
    component: ProcessDetailPageComponent,
    data: { tab: 'overview' },
  },
  {
    path: 'catalog/processes/:processId/diagram',
    component: ProcessDetailPageComponent,
    data: { tab: 'diagram' },
  },
  {
    path: 'catalog/processes/:processId/procedures',
    component: ProcessDetailPageComponent,
    data: { tab: 'procedures' },
  },
  {
    path: 'catalog/processes/:processId/history',
    component: ProcessDetailPageComponent,
    data: { tab: 'history' },
  },
  {
    path: 'catalog/processes/:processId/compare',
    component: ProcessDetailPageComponent,
    data: { tab: 'compare' },
  },
  {
    path: 'catalog/procedures/:id',
    component: ProcedureDetailPageComponent,
  },
  {
    path: 'glossary',
    component: GlossaryPageComponent,
  },
  {
    path: 'methodology',
    component: MethodologyPageComponent,
  },
  {
    path: 'faq',
    component: FaqPageComponent,
  },
];
