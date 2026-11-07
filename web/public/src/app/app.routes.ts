import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.page').then((module) => module.HomePageComponent),
  },
  {
    path: 'catalog',
    redirectTo: 'catalog/processes',
    pathMatch: 'full',
  },
  {
    path: 'catalog/processes',
    loadComponent: () =>
      import('./features/process-list/process-list.page').then(
        (module) => module.ProcessListPageComponent,
      ),
    data: { defaultCatalogTab: 'processes', pageTitle: 'Processes' },
  },
  {
    path: 'catalog/procedures',
    loadComponent: () =>
      import('./features/process-list/process-list.page').then(
        (module) => module.ProcessListPageComponent,
      ),
    data: { defaultCatalogTab: 'procedures', pageTitle: 'Procedures' },
  },
  {
    path: 'catalog/processes/:processId',
    loadComponent: () =>
      import('./features/process-detail/process-detail.page').then(
        (module) => module.ProcessDetailPageComponent,
      ),
    data: { tab: 'default' },
  },
  {
    path: 'catalog/processes/:processId/overview',
    loadComponent: () =>
      import('./features/process-detail/process-detail.page').then(
        (module) => module.ProcessDetailPageComponent,
      ),
    data: { tab: 'overview' },
  },
  {
    path: 'catalog/processes/:processId/diagram',
    loadComponent: () =>
      import('./features/process-detail/process-detail.page').then(
        (module) => module.ProcessDetailPageComponent,
      ),
    data: { tab: 'diagram' },
  },
  {
    path: 'catalog/processes/:processId/procedures',
    loadComponent: () =>
      import('./features/process-detail/process-detail.page').then(
        (module) => module.ProcessDetailPageComponent,
      ),
    data: { tab: 'procedures' },
  },
  {
    path: 'catalog/processes/:processId/history',
    loadComponent: () =>
      import('./features/process-detail/process-detail.page').then(
        (module) => module.ProcessDetailPageComponent,
      ),
    data: { tab: 'history' },
  },
  {
    path: 'catalog/processes/:processId/compare',
    loadComponent: () =>
      import('./features/process-detail/process-detail.page').then(
        (module) => module.ProcessDetailPageComponent,
      ),
    data: { tab: 'compare' },
  },
  {
    path: 'catalog/procedures/:id',
    loadComponent: () =>
      import('./features/procedure-detail/procedure-detail.page').then(
        (module) => module.ProcedureDetailPageComponent,
      ),
  },
  {
    path: 'glossary',
    loadComponent: () =>
      import('./features/glossary/glossary.page').then((module) => module.GlossaryPageComponent),
  },
  {
    path: 'methodology',
    loadComponent: () =>
      import('./features/methodology/methodology.page').then(
        (module) => module.MethodologyPageComponent,
      ),
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./features/faq/faq.page').then((module) => module.FaqPageComponent),
  },
];
