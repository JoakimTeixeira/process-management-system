import { getBackofficeApiBaseUrl } from './backoffice-api-base-url';

describe('getBackofficeApiBaseUrl', () => {
  it('returns the local API when no browser location is available', () => {
    expect(getBackofficeApiBaseUrl(null)).toBe('http://localhost:3000');
  });

  it('uses the nginx proxy for the docker-served backoffice', () => {
    expect(
      getBackofficeApiBaseUrl({ hostname: 'localhost', port: '8081' }),
    ).toBe('/api');
  });

  it('uses the local API for Angular development ports', () => {
    expect(
      getBackofficeApiBaseUrl({ hostname: '127.0.0.1', port: '4200' }),
    ).toBe('http://127.0.0.1:3000');
  });

  it('uses the nginx proxy for non-local hosts', () => {
    expect(
      getBackofficeApiBaseUrl({ hostname: 'backoffice.example.com', port: '443' }),
    ).toBe('/api');
  });
});
