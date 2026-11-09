import { buildDatabaseConfig } from './database.config';
import type { EnvironmentVariables } from './env.validation';

import {
  DEFAULT_DB_PORT,
  DEFAULT_PORT,
  TEST_DATABASE_PORT,
  TEST_PORT,
} from '../common/constants/workflow.constants';

const baseEnvironment: EnvironmentVariables = {
  NODE_ENV: 'development',
  PORT: DEFAULT_PORT,
  DB_HOST: 'localhost',
  DB_PORT: DEFAULT_DB_PORT,
  DB_USERNAME: 'user',
  DB_PASSWORD: 'pass',
  DB_NAME: 'db',
  DB_SSL: false,
  PASSWORD_PEPPER: 'pepper',
  JWT_SECRET: 'secret',
  JWT_EXPIRES_IN: '15m',
};

describe('database.config', () => {
  it('should build database config from environment', () => {
    const config = buildDatabaseConfig(baseEnvironment);

    expect(config).toEqual({
      host: 'localhost',
      port: DEFAULT_DB_PORT,
      username: 'user',
      password: 'pass',
      database: 'db',
      ssl: false,
    });
  });

  it('should build database config with SSL enabled', () => {
    const config = buildDatabaseConfig({
      ...baseEnvironment,
      NODE_ENV: 'production',
      PORT: TEST_PORT,
      DB_HOST: 'prod-db.example.com',
      DB_USERNAME: 'prod-user',
      DB_PASSWORD: 'prod-password',
      DB_NAME: 'prod-db',
      DB_SSL: true,
    });

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
    const config = buildDatabaseConfig({
      ...baseEnvironment,
      DB_PORT: TEST_DATABASE_PORT,
    });

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
