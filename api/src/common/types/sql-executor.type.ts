export interface SqlExecutor {
  query<T = unknown>(
    query: string,
    parameters?: readonly unknown[],
  ): Promise<T>;
}
