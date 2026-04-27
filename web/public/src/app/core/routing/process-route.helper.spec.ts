import {
  getArchitectureRouteSegment,
  getProcessTabIdFromIndex,
  getProcessTabIdFromUrl,
  getProcessTabIndex,
  getProcessTabRoute,
} from './process-route.helper';

describe('process-route.helper', () => {
  it('maps process routes to the correct tab ids', () => {
    expect(getProcessTabIdFromUrl('/catalog/processes/1/overview')).toBe('overview');
    expect(getProcessTabIdFromUrl('/catalog/processes/1/diagram')).toBe('diagram');
    expect(getProcessTabIdFromUrl('/catalog/processes/1/procedures')).toBe('procedures');
    expect(getProcessTabIdFromUrl('/catalog/processes/1/history')).toBe('history');
    expect(getProcessTabIdFromUrl('/catalog/processes/1/compare')).toBe('compare');
    expect(getProcessTabIdFromUrl('/catalog/processes/1')).toBe('default');
  });

  it('maps tab ids and indexes consistently', () => {
    expect(getProcessTabIndex('default')).toBe(0);
    expect(getProcessTabIndex('diagram')).toBe(1);
    expect(getProcessTabIdFromIndex(2)).toBe('procedures');
    expect(getProcessTabIdFromIndex(4)).toBe('compare');
  });

  it('builds route paths for each process tab and architecture segment', () => {
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
});
