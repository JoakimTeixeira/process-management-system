import 'reflect-metadata';

import { Client } from 'pg';
import { DataSource } from 'typeorm';

import type { DatabaseConfig } from '../../src/config/database.config';
import { loadProjectEnvironment } from '../../src/config/env-paths';
import { createDataSourceOptions } from '../../src/database/typeorm-options';

export const DEFAULT_INTEGRATION_DATABASE_NAME =
  'process_management_system_integration_test';

const MAINTENANCE_DATABASE_NAME = 'postgres';
const TEST_NAME_PATTERN = /(^|[_-])test(?:ing)?([_-]|$)/i;

loadProjectEnvironment();

function readConnectionValue(
  environment: NodeJS.ProcessEnv,
  integrationKey: string,
  baseKey: string,
): string {
  const value = environment[integrationKey] ?? environment[baseKey];

  if (!value) {
    throw new Error(
      `Integration database configuration requires ${integrationKey} or ${baseKey}.`,
    );
  }

  return value;
}

function readPort(value: string): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid integration database port: ${value}.`);
  }

  return port;
}

function readBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true';
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

export function assertSafeIntegrationDatabaseName(databaseName: string): void {
  if (
    !TEST_NAME_PATTERN.test(databaseName) ||
    databaseName.toLowerCase() === MAINTENANCE_DATABASE_NAME
  ) {
    throw new Error(
      `Refusing integration database cleanup for "${databaseName || '<empty>'}": the name must be explicitly test-scoped.`,
    );
  }
}

export function buildIntegrationDatabaseConfig(
  environment: NodeJS.ProcessEnv = process.env,
): DatabaseConfig {
  const database =
    environment.INTEGRATION_DB_NAME ?? DEFAULT_INTEGRATION_DATABASE_NAME;
  assertSafeIntegrationDatabaseName(database);

  return {
    host: readConnectionValue(environment, 'INTEGRATION_DB_HOST', 'DB_HOST'),
    port: readPort(
      readConnectionValue(environment, 'INTEGRATION_DB_PORT', 'DB_PORT'),
    ),
    username: readConnectionValue(
      environment,
      'INTEGRATION_DB_USERNAME',
      'DB_USERNAME',
    ),
    password: readConnectionValue(
      environment,
      'INTEGRATION_DB_PASSWORD',
      'DB_PASSWORD',
    ),
    database,
    ssl: readBoolean(environment.INTEGRATION_DB_SSL ?? environment.DB_SSL),
  };
}

function createMaintenanceClient(config: DatabaseConfig): Client {
  return new Client({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: MAINTENANCE_DATABASE_NAME,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
  });
}

async function terminateDatabaseConnections(
  client: Client,
  databaseName: string,
): Promise<void> {
  await client.query(
    `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1
        AND pid <> pg_backend_pid()
    `,
    [databaseName],
  );
}

export function createIntegrationDataSource(
  config = buildIntegrationDatabaseConfig(),
): DataSource {
  return new DataSource(createDataSourceOptions(config));
}

export async function resetIntegrationDatabase(
  config = buildIntegrationDatabaseConfig(),
): Promise<void> {
  assertSafeIntegrationDatabaseName(config.database);
  const client = createMaintenanceClient(config);
  await client.connect();

  try {
    await terminateDatabaseConnections(client, config.database);
    await client.query(
      `DROP DATABASE IF EXISTS ${quoteIdentifier(config.database)}`,
    );
    await client.query(`CREATE DATABASE ${quoteIdentifier(config.database)}`);
  } finally {
    await client.end();
  }
}

export async function migrateIntegrationDatabase(
  config = buildIntegrationDatabaseConfig(),
): Promise<void> {
  assertSafeIntegrationDatabaseName(config.database);
  const dataSource = createIntegrationDataSource(config);
  await dataSource.initialize();

  try {
    await dataSource.runMigrations({ transaction: 'all' });
  } finally {
    await dataSource.destroy();
  }
}

export async function dropIntegrationDatabase(
  config = buildIntegrationDatabaseConfig(),
): Promise<void> {
  assertSafeIntegrationDatabaseName(config.database);
  const client = createMaintenanceClient(config);
  await client.connect();

  try {
    await terminateDatabaseConnections(client, config.database);
    await client.query(
      `DROP DATABASE IF EXISTS ${quoteIdentifier(config.database)}`,
    );
  } finally {
    await client.end();
  }
}
