type LocationLike = Pick<Location, 'hostname' | 'port'>;

const DOCKER_WEB_PORTS = new Set(['8080', '8081']);

function isLocalDevelopmentHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function getBackofficeApiBaseUrl(
  location: LocationLike | null =
    typeof window === 'undefined' ? null : window.location,
): string {
  if (!location) {
    return 'http://localhost:3000';
  }

  const { hostname, port } = location;

  if (isLocalDevelopmentHost(hostname)) {
    if (DOCKER_WEB_PORTS.has(port)) {
      return '/api';
    }

    if (port !== '3000') {
      return `http://${hostname}:3000`;
    }

    return '';
  }

  return '/api';
}

export const BACKOFFICE_API_BASE_URL = getBackofficeApiBaseUrl();
