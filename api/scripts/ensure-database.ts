import 'dotenv/config';

import { Client } from 'pg';

import { buildDatabaseConfig } from '../src/config/database.config';

const MAINTENANCE_DATABASE_NAME = 'postgres';
const PROCESS_EXIT_FAILURE_CODE = 1;

interface DatabaseExistsRow {
  exists: boolean;
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function writeInfoMessage(message: string): void {
  process.stdout.write(`${message}\n`);
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return 'An unknown non-serializable error occurred.';
    }
  }

  if (typeof error === 'string') {
    return error;
  }

  if (
    typeof error === 'number' ||
    typeof error === 'boolean' ||
    typeof error === 'bigint'
  ) {
    return error.toString();
  }

  if (typeof error === 'symbol') {
    return error.description ?? 'An unknown symbol error occurred.';
  }

  if (error === undefined) {
    return 'An undefined error occurred.';
  }

  return 'An unknown error occurred.';
}

async function databaseExists(
  client: Client,
  databaseName: string,
): Promise<boolean> {
  const result = await client.query<DatabaseExistsRow>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM pg_database
        WHERE datname = $1
      ) AS exists
    `,
    [databaseName],
  );

  return result.rows[0]?.exists ?? false;
}

async function ensureDatabase(): Promise<void> {
  const dbConfig = buildDatabaseConfig();
  const maintenanceClient = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: MAINTENANCE_DATABASE_NAME,
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
  });

  await maintenanceClient.connect();

  try {
    const exists = await databaseExists(maintenanceClient, dbConfig.database);

    if (exists) {
      writeInfoMessage(`Database "${dbConfig.database}" already exists.`);
      return;
    }

    await maintenanceClient.query(
      `CREATE DATABASE ${quoteIdentifier(dbConfig.database)}`,
    );
    writeInfoMessage(`Created database "${dbConfig.database}".`);
  } finally {
    await maintenanceClient.end();
  }
}

void ensureDatabase().catch((caughtError: unknown) => {
  const errorMessage = formatErrorMessage(caughtError);
  process.stderr.write(errorMessage);
  process.stderr.write('\n');
  process.exitCode = PROCESS_EXIT_FAILURE_CODE;
});
