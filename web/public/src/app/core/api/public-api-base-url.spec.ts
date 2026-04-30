import { getPublicApiBaseUrl } from './public-api-base-url';

describe('getPublicApiBaseUrl', () => {
  it('returns the local API when no browser location is available', () => {
    expect(getPublicApiBaseUrl(null)).toBe('http://localhost:3000');
  });

  it('uses the nginx proxy for the docker-served public portal', () => {
    expect(
      getPublicApiBaseUrl({ hostname: 'localhost', port: '8080' }),
    ).toBe('/api');
  });

  it('uses the local API for Angular development ports', () => {
    expect(
      getPublicApiBaseUrl({ hostname: '127.0.0.1', port: '4201' }),
    ).toBe('http://127.0.0.1:3000');
  });

  it('uses the nginx proxy for non-local hosts', () => {
    expect(
      getPublicApiBaseUrl({ hostname: 'process.example.com', port: '443' }),
    ).toBe('/api');
  });
});
