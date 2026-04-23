import { join } from 'node:path';

import { ConfigType } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

import databaseConfig from '../config/database.config';

const getMigrationPaths = (): string[] => [
  join(process.cwd(), 'migrations', '*{.ts,.js}'),
  join(process.cwd(), 'dist', 'migrations', '*.js'),
];

const buildSharedOptions = (dbConfig: ConfigType<typeof databaseConfig>) => ({
  type: 'postgres' as const,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: 'migrations',
  migrations: getMigrationPaths(),
});

export function createTypeOrmModuleOptions(
  dbConfig: ConfigType<typeof databaseConfig>,
): TypeOrmModuleOptions {
  return {
    ...buildSharedOptions(dbConfig),
    autoLoadEntities: true,
  };
}

export function createDataSourceOptions(
  dbConfig: ConfigType<typeof databaseConfig>,
): DataSourceOptions {
  return {
    ...buildSharedOptions(dbConfig),
    entities: [],
  };
}
