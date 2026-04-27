function isLocalDevelopmentHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function getPublicApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }

  const { hostname, port } = window.location;

  if (isLocalDevelopmentHost(hostname) && port !== '3000') {
    return `http://${hostname}:3000`;
  }

  return '';
}

export const PUBLIC_API_BASE_URL = getPublicApiBaseUrl();
