import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { appConfig } from './app.config';
import { routes } from './app.routes';

describe('public app routes', () => {
  it('should preserve the public paths, redirect, and route data', () => {
    expect(
      routes.map(({ path, pathMatch, redirectTo, data }) => ({
        path,
        pathMatch,
        redirectTo,
        data,
      })),
    ).toEqual([
      { path: '', pathMatch: undefined, redirectTo: undefined, data: undefined },
      {
        path: 'catalog',
        pathMatch: 'full',
        redirectTo: 'catalog/processes',
        data: undefined,
      },
      {
        path: 'catalog/processes',
        pathMatch: undefined,
        redirectTo: undefined,
        data: { defaultCatalogTab: 'processes', pageTitle: 'Processes' },
      },
      {
        path: 'catalog/procedures',
        pathMatch: undefined,
        redirectTo: undefined,
        data: { defaultCatalogTab: 'procedures', pageTitle: 'Procedures' },
      },
      {
        path: 'catalog/processes/:processId',
        pathMatch: undefined,
        redirectTo: undefined,
        data: { tab: 'default' },
      },
      {
        path: 'catalog/processes/:processId/overview',
        pathMatch: undefined,
        redirectTo: undefined,
        data: { tab: 'overview' },
      },
      {
        path: 'catalog/processes/:processId/diagram',
        pathMatch: undefined,
        redirectTo: undefined,
        data: { tab: 'diagram' },
      },
      {
        path: 'catalog/processes/:processId/procedures',
        pathMatch: undefined,
        redirectTo: undefined,
        data: { tab: 'procedures' },
      },
      {
        path: 'catalog/processes/:processId/history',
        pathMatch: undefined,
        redirectTo: undefined,
        data: { tab: 'history' },
      },
      {
        path: 'catalog/processes/:processId/compare',
        pathMatch: undefined,
        redirectTo: undefined,
        data: { tab: 'compare' },
      },
      {
        path: 'catalog/procedures/:id',
        pathMatch: undefined,
        redirectTo: undefined,
        data: undefined,
      },
      { path: 'glossary', pathMatch: undefined, redirectTo: undefined, data: undefined },
      { path: 'methodology', pathMatch: undefined, redirectTo: undefined, data: undefined },
      { path: 'faq', pathMatch: undefined, redirectTo: undefined, data: undefined },
    ]);
  });

  it('should load every feature route lazily', () => {
    const featureRoutes = routes.filter((route) => route.redirectTo === undefined);

    expect(featureRoutes).not.toHaveLength(0);
    for (const route of featureRoutes) {
      expect(route.component, route.path).toBeUndefined();
      expect(route.loadComponent, route.path).toEqual(expect.any(Function));
    }
  });

  it('should enable router component input binding', () => {
    TestBed.configureTestingModule({ providers: appConfig.providers });

    expect(TestBed.inject(Router).componentInputBindingEnabled).toBe(true);
  });
});
