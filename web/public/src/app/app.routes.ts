import { Routes } from '@angular/router';

const loadProcessListPage = () =>
  import('./features/process-list/process-list.page').then(
    (module) => module.ProcessListPageComponent,
  );

const loadProcessDetailPage = () =>
  import('./features/process-detail/process-detail.page').then(
    (module) => module.ProcessDetailPageComponent,
  );

const PROCESS_DETAIL_TABS = [
  ['', 'default'],
  ['/overview', 'overview'],
  ['/diagram', 'diagram'],
  ['/procedures', 'procedures'],
  ['/history', 'history'],
  ['/compare', 'compare'],
] as const;

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.page').then(
        (module) => module.HomePageComponent,
      ),
  },
  {
    path: 'catalog',
    redirectTo: 'catalog/processes',
    pathMatch: 'full',
  },
  {
    path: 'catalog/processes',
    loadComponent: loadProcessListPage,
    data: { defaultCatalogTab: 'processes', pageTitle: 'Processes' },
  },
  {
    path: 'catalog/procedures',
    loadComponent: loadProcessListPage,
    data: { defaultCatalogTab: 'procedures', pageTitle: 'Procedures' },
  },
  ...PROCESS_DETAIL_TABS.map(([suffix, tab]) => ({
    path: `catalog/processes/:processId${suffix}`,
    loadComponent: loadProcessDetailPage,
    data: { tab },
  })),
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
      import('./features/glossary/glossary.page').then(
        (module) => module.GlossaryPageComponent,
      ),
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
      import('./features/faq/faq.page').then(
        (module) => module.FaqPageComponent,
      ),
  },
];
