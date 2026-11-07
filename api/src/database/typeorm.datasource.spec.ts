import type { Mock } from 'vitest';

import { DataSource } from 'typeorm';

import { buildDatabaseConfig } from '../config/database.config';
import { createDataSourceOptions } from './typeorm-options';

import { DEFAULT_DB_PORT } from '../common/constants/workflow.constants';

vi.mock('typeorm', () => ({
  DataSource: vi.fn(),
}));

vi.mock('../config/database.config', () => ({
  buildDatabaseConfig: vi.fn(),
}));

vi.mock('./typeorm-options', () => ({
  createDataSourceOptions: vi.fn(),
}));

describe('typeorm.datasource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a DataSource with correct options', async () => {
    const mockDbConfig = {
      host: 'localhost',
      port: DEFAULT_DB_PORT,
      username: 'user',
      password: 'pass',
      database: 'db',
      ssl: false,
    };

    const mockOptions = {
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
      migrations: [],
      entities: [],
    };

    (buildDatabaseConfig as Mock).mockReturnValue(mockDbConfig);
    (createDataSourceOptions as Mock).mockReturnValue(mockOptions);
    (DataSource as Mock).mockImplementation(function DataSourceMock() {
      return {
        initialize: vi.fn(),
      };
    });

    await import('./typeorm.datasource');

    expect(buildDatabaseConfig).toHaveBeenCalled();
    expect(createDataSourceOptions).toHaveBeenCalledWith(mockDbConfig);
    expect(DataSource).toHaveBeenCalledWith(mockOptions);
  });
});
