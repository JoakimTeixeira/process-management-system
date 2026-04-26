import { buildDatabaseConfig } from './database.config';
import { getValidatedEnvironment } from './env.validation';

import {
  DEFAULT_DB_PORT,
  DEFAULT_PORT,
  TEST_DATABASE_PORT,
  TEST_PORT,
  TEST_TOKEN_EXPIRES_IN_SECONDS,
} from '../common/constants/workflow.constants';

jest.mock('./env.validation');

describe('database.config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build database config from environment', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      NODE_ENV: 'development',
      PORT: DEFAULT_PORT,
      DB_HOST: 'localhost',
      DB_PORT: DEFAULT_DB_PORT,
      DB_USERNAME: 'user',
      DB_PASSWORD: 'pass',
      DB_NAME: 'db',
      DB_SSL: false,
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN_SECONDS: TEST_TOKEN_EXPIRES_IN_SECONDS,
      PASSWORD_PEPPER: 'pepper',
    });

    const config = buildDatabaseConfig();

    expect(config).toEqual({
      host: 'localhost',
      port: DEFAULT_DB_PORT,
      username: 'user',
      password: 'pass',
      database: 'db',
      ssl: false,
    });
    expect(getValidatedEnvironment).toHaveBeenCalled();
  });

  it('should build database config with SSL enabled', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      NODE_ENV: 'production',
      PORT: TEST_PORT,
      DB_HOST: 'prod-db.example.com',
      DB_PORT: DEFAULT_DB_PORT,
      DB_USERNAME: 'prod-user',
      DB_PASSWORD: 'prod-password',
      DB_NAME: 'prod-db',
      DB_SSL: true,
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN_SECONDS: TEST_TOKEN_EXPIRES_IN_SECONDS,
      PASSWORD_PEPPER: 'pepper',
    });

    const config = buildDatabaseConfig();

    expect(config).toEqual({
      host: 'prod-db.example.com',
      port: DEFAULT_DB_PORT,
      username: 'prod-user',
      password: 'prod-password',
      database: 'prod-db',
      ssl: true,
    });
  });

  it('should build database config with custom port', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      NODE_ENV: 'development',
      PORT: DEFAULT_PORT,
      DB_HOST: 'localhost',
      DB_PORT: TEST_DATABASE_PORT,
      DB_USERNAME: 'user',
      DB_PASSWORD: 'pass',
      DB_NAME: 'db',
      DB_SSL: false,
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN_SECONDS: TEST_TOKEN_EXPIRES_IN_SECONDS,
      PASSWORD_PEPPER: 'pepper',
    });

    const config = buildDatabaseConfig();

    expect(config).toEqual({
      host: 'localhost',
      port: TEST_DATABASE_PORT,
      username: 'user',
      password: 'pass',
      database: 'db',
      ssl: false,
    });
  });
});
