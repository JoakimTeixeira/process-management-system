import { HttpErrorResponse } from '@angular/common/http';

export function getHttpErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof HttpErrorResponse) {
    if (typeof error.error?.message === 'string' && error.error.message.length > 0) {
      return error.error.message;
    }

    if (typeof error.error === 'string' && error.error.length > 0) {
      return error.error;
    }

    if (error.status > 0) {
      return `${fallback} (${error.status} ${error.statusText || 'Request failed'})`;
    }
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return fallback;
}
