import { convertToParamMap } from '@angular/router';

import {
  buildCatalogQueryParams,
  normalizeArchitectureFilter,
  readCatalogQueryState,
} from './catalog-query-state';

describe('catalog-query-state', () => {
  it('should read and trims canonical catalog query values', () => {
    expect(
      readCatalogQueryState(
        convertToParamMap({
          search: '  incident  ',
          areaId: 'area-1',
          architecture: 'TO-BE',
          processId: 'process-1',
        }),
        'procedures',
      ),
    ).toEqual({
      tab: 'procedures',
      search: 'incident',
      areaId: 'area-1',
      architecture: 'TO-BE',
      processId: 'process-1',
    });
  });

  it('should not treat presentation route values as domain architecture states', () => {
    expect(normalizeArchitectureFilter('as-is')).toBe('');
    expect(normalizeArchitectureFilter('to-be')).toBe('');
    expect(normalizeArchitectureFilter('AS-IS')).toBe('AS-IS');
  });

  it('should drop a procedure-only process filter from process navigation', () => {
    expect(
      buildCatalogQueryParams({
        tab: 'processes',
        search: '',
        areaId: '',
        architecture: '',
        processId: 'process-1',
      }),
    ).toEqual({
      search: null,
      areaId: null,
      architecture: null,
      processId: null,
      tab: null,
    });
  });

  it('should preserve a selected process when navigating the procedure catalog', () => {
    expect(
      buildCatalogQueryParams({
        tab: 'procedures',
        search: 'review',
        areaId: 'area-1',
        architecture: 'AS-IS',
        processId: 'process-1',
      }),
    ).toMatchObject({
      search: 'review',
      areaId: 'area-1',
      architecture: 'AS-IS',
      processId: 'process-1',
    });
  });
});
