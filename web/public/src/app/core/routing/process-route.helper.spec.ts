import {
  getArchitectureRouteSegment,
  getCatalogRoute,
  getProcessTabIdFromIndex,
  getProcessTabIdFromUrl,
  getProcessTabIndex,
  getProcessTabRoute,
  normalizeCatalogSearchHref,
  parseCatalogNavigationTarget,
  serializeCatalogNavigationTarget,
} from './process-route.helper';

describe('process-route.helper', () => {
  it('should map process routes to the correct tab ids', () => {
    expect(getProcessTabIdFromUrl('/catalog/processes/1/overview')).toBe('overview');
    expect(getProcessTabIdFromUrl('/catalog/processes/1/diagram')).toBe('diagram');
    expect(getProcessTabIdFromUrl('/catalog/processes/1/procedures')).toBe('procedures');
    expect(getProcessTabIdFromUrl('/catalog/processes/1/history')).toBe('history');
    expect(getProcessTabIdFromUrl('/catalog/processes/1/compare')).toBe('compare');
    expect(getProcessTabIdFromUrl('/catalog/processes/1')).toBe('default');
  });

  it('should map tab ids and indexes consistently', () => {
    expect(getProcessTabIndex('default')).toBe(0);
    expect(getProcessTabIndex('diagram')).toBe(1);
    expect(getProcessTabIdFromIndex(2)).toBe('procedures');
    expect(getProcessTabIdFromIndex(4)).toBe('compare');
  });

  it('should build route paths for each process tab and architecture segment', () => {
    expect(getCatalogRoute('processes')).toBe('/catalog/processes');
    expect(getCatalogRoute('procedures')).toBe('/catalog/procedures');
    expect(getProcessTabRoute('process-1', 'overview')).toBe('/catalog/processes/process-1');
    expect(getProcessTabRoute('process-1', 'diagram')).toBe('/catalog/processes/process-1/diagram');
    expect(getProcessTabRoute('process-1', 'procedures')).toBe(
      '/catalog/processes/process-1/procedures',
    );
    expect(getProcessTabRoute('process-1', 'history')).toBe('/catalog/processes/process-1/history');
    expect(getProcessTabRoute('process-1', 'compare')).toBe('/catalog/processes/process-1/compare');
    expect(getArchitectureRouteSegment('AS-IS')).toBe('as-is');
    expect(getArchitectureRouteSegment('TO-BE')).toBe('to-be');
  });

  it('should normalize legacy API search hrefs through one route boundary', () => {
    expect(normalizeCatalogSearchHref('Process', '/processes?areaId=area-1')).toBe(
      '/catalog/processes?areaId=area-1',
    );
    expect(normalizeCatalogSearchHref('Procedure', '/procedures/procedure-1')).toBe(
      '/catalog/procedures/procedure-1',
    );
    expect(normalizeCatalogSearchHref('Process', '/processes/process-1/to-be')).toBe(
      '/catalog/processes/process-1?view=to-be',
    );
    expect(normalizeCatalogSearchHref('Asset', '/processes/process-1/as-is')).toBe(
      '/catalog/processes/process-1/diagram?view=as-is',
    );
    expect(normalizeCatalogSearchHref('Asset', '/processes/process-1/diagram/to-be')).toBe(
      '/catalog/processes/process-1/diagram?view=to-be',
    );
    expect(normalizeCatalogSearchHref('Process', '/processes/process-1/overview?view=as-is')).toBe(
      '/catalog/processes/process-1?view=as-is',
    );
  });

  it('should parse and serialize normalized navigation targets without losing query params', () => {
    const target = parseCatalogNavigationTarget(
      '/catalog/processes/process-1/diagram?view=to-be&origin=search',
    );

    expect(target).toEqual({
      routePath: '/catalog/processes/process-1/diagram',
      routeSegments: ['/catalog', 'processes', 'process-1', 'diagram'],
      queryParams: { view: 'to-be', origin: 'search' },
    });
    expect(serializeCatalogNavigationTarget(target.routePath, target.queryParams)).toBe(
      '/catalog/processes/process-1/diagram?view=to-be&origin=search',
    );
  });
});
