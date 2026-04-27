import type { DataSource } from 'typeorm';

import type { QueryRow } from './public-portal.repository.types';

export async function queryRows<T extends QueryRow>(
  dataSource: DataSource,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await dataSource.query(sql, [...parameters]);
}
