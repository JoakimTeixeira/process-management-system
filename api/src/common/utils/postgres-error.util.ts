interface PostgresErrorLike {
  code?: string;
}

const UNIQUE_VIOLATION_ERROR_CODE = '23505';

export function isUniqueViolationError(
  error: unknown,
): error is PostgresErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as PostgresErrorLike).code === UNIQUE_VIOLATION_ERROR_CODE
  );
}
