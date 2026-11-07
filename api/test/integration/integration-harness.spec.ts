import type { DataSource } from 'typeorm';

import {
  buildIntegrationDatabaseConfig,
  createIntegrationDataSource,
} from './integration-database';

interface CurrentDatabaseRow {
  current_database: string;
}

interface CountRow {
  count: string;
}

interface TableRow {
  table_name: string;
}

describe('Postgres integration harness', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = createIntegrationDataSource();
    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('connects only to the configured integration database', async () => {
    const [row] = await dataSource.query<CurrentDatabaseRow[]>(
      'SELECT current_database()',
    );

    expect(row?.current_database).toBe(
      buildIntegrationDatabaseConfig().database,
    );
  });

  it('runs the project migrations before integration specs', async () => {
    const [migrationCount] = await dataSource.query<CountRow[]>(
      'SELECT COUNT(*)::text AS count FROM migrations',
    );
    const tables = await dataSource.query<TableRow[]>(
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('areas', 'processes', 'process_versions', 'procedures')
        ORDER BY table_name
      `,
    );

    expect(Number(migrationCount?.count)).toBeGreaterThan(0);
    expect(tables.map((row) => row.table_name)).toEqual([
      'areas',
      'procedures',
      'process_versions',
      'processes',
    ]);
  });
});
