import { mapSelectedArchitectureFilters } from './process-catalog-filter.util';

describe('process-catalog-filter.util', () => {
  it('maps selected architecture filters into a query string', () => {
    expect(mapSelectedArchitectureFilters([])).toBeNull();
    expect(mapSelectedArchitectureFilters(['AS-IS'])).toBe('AS-IS');
    expect(mapSelectedArchitectureFilters(['AS-IS', 'TO-BE'])).toBe('AS-IS,TO-BE');
    expect(mapSelectedArchitectureFilters(['AS-IS', 'AS-IS', 'TO-BE'])).toBe('AS-IS,TO-BE');
  });
});
