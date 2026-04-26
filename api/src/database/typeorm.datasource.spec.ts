import { DataSource } from 'typeorm';

import { buildDatabaseConfig } from '../config/database.config';
import { createDataSourceOptions } from './typeorm-options';

import { DEFAULT_DB_PORT } from '../common/constants/workflow.constants';

jest.mock('typeorm', () => ({
  DataSource: jest.fn(),
}));

jest.mock('../config/database.config', () => ({
  buildDatabaseConfig: jest.fn(),
}));

jest.mock('./typeorm-options', () => ({
  createDataSourceOptions: jest.fn(),
}));

describe('typeorm.datasource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a DataSource with correct options', () => {
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

    (buildDatabaseConfig as jest.Mock).mockReturnValue(mockDbConfig);
    (createDataSourceOptions as jest.Mock).mockReturnValue(mockOptions);
    (DataSource as jest.Mock).mockImplementation(() => ({
      initialize: jest.fn(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./typeorm.datasource');

    expect(buildDatabaseConfig).toHaveBeenCalled();
    expect(createDataSourceOptions).toHaveBeenCalledWith(mockDbConfig);
    expect(DataSource).toHaveBeenCalledWith(mockOptions);
  });
});
