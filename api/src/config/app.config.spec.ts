import { buildAppConfig } from './app.config';
import type { EnvironmentVariables } from './env.validation';

import {
  DEFAULT_DB_PORT,
  DEFAULT_PORT,
  TEST_PORT,
  TEST_PORT_ALTERNATIVE,
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

describe('app.config', () => {
  it('should build app config from environment', () => {
    const config = buildAppConfig(baseEnvironment);

    expect(config).toEqual({
      nodeEnv: 'development',
      port: DEFAULT_PORT,
    });
  });

  it('should build app config with production environment', () => {
    const config = buildAppConfig({
      ...baseEnvironment,
      NODE_ENV: 'production',
      PORT: TEST_PORT,
      DB_SSL: true,
    });

    expect(config).toEqual({
      nodeEnv: 'production',
      port: TEST_PORT,
    });
  });

  it('should build app config with test environment', () => {
    const config = buildAppConfig({
      ...baseEnvironment,
      NODE_ENV: 'test',
      PORT: TEST_PORT_ALTERNATIVE,
    });

    expect(config).toEqual({
      nodeEnv: 'test',
      port: TEST_PORT_ALTERNATIVE,
    });
  });
});
