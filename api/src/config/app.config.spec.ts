import { buildAppConfig } from './app.config';
import { getValidatedEnvironment } from './env.validation';

import {
  DEFAULT_DB_PORT,
  DEFAULT_PORT,
  TEST_PORT,
  TEST_PORT_ALTERNATIVE,
  TEST_TOKEN_EXPIRES_IN_SECONDS,
} from '../common/constants/workflow.constants';

jest.mock('./env.validation');

describe('app.config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build app config from environment', () => {
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

    const config = buildAppConfig();

    expect(config).toEqual({
      nodeEnv: 'development',
      port: DEFAULT_PORT,
    });
    expect(getValidatedEnvironment).toHaveBeenCalled();
  });

  it('should build app config with production environment', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      NODE_ENV: 'production',
      PORT: TEST_PORT,
      DB_HOST: 'localhost',
      DB_PORT: DEFAULT_DB_PORT,
      DB_USERNAME: 'user',
      DB_PASSWORD: 'pass',
      DB_NAME: 'db',
      DB_SSL: true,
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN_SECONDS: TEST_TOKEN_EXPIRES_IN_SECONDS,
      PASSWORD_PEPPER: 'pepper',
    });

    const config = buildAppConfig();

    expect(config).toEqual({
      nodeEnv: 'production',
      port: TEST_PORT,
    });
  });

  it('should build app config with test environment', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      NODE_ENV: 'test',
      PORT: TEST_PORT_ALTERNATIVE,
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

    const config = buildAppConfig();

    expect(config).toEqual({
      nodeEnv: 'test',
      port: TEST_PORT_ALTERNATIVE,
    });
  });
});
