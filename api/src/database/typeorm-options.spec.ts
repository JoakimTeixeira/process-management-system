import { createDataSourceOptions, createTypeOrmModuleOptions } from './typeorm-options';
import type { DatabaseConfig } from '../config/database.config';

import { DEFAULT_DB_PORT } from '../common/constants/workflow.constants';

describe('typeorm-options', () => {
  const mockDbConfig: DatabaseConfig = {
    host: 'localhost',
    port: DEFAULT_DB_PORT,
    username: 'user',
    password: 'pass',
    database: 'db',
    ssl: false,
  };

  it('should create TypeOrm module options', () => {
    const options = createTypeOrmModuleOptions(mockDbConfig);

    expect(options).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: DEFAULT_DB_PORT,
      username: 'user',
      password: 'pass',
      database: 'db',
      ssl: false,
      synchronize: false,
      migrationsRun: false,
      migrationsTableName: 'migrations',
      autoLoadEntities: true,
    });
    expect(options.migrations).toBeDefined();
    expect(Array.isArray(options.migrations)).toBe(true);
  });

  it('should create TypeOrm module options with SSL', () => {
    const sslConfig: DatabaseConfig = { ...mockDbConfig, ssl: true };

    const options = createTypeOrmModuleOptions(sslConfig);

    expect(options).toMatchObject({
      type: 'postgres',
      ssl: { rejectUnauthorized: false },
    });
  });

  it('should create data source options', () => {
    const options = createDataSourceOptions(mockDbConfig);

    expect(options).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: DEFAULT_DB_PORT,
      username: 'user',
      password: 'pass',
      database: 'db',
      ssl: false,
      synchronize: false,
      migrationsRun: false,
      migrationsTableName: 'migrations',
      entities: [],
    });
    expect(options.migrations).toBeDefined();
    expect(Array.isArray(options.migrations)).toBe(true);
  });
});
