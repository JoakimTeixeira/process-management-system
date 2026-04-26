import { buildAppConfig } from './app.config';
import { getValidatedEnvironment } from './env.validation';

jest.mock('./env.validation');

describe('app.config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build app config from environment', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      NODE_ENV: 'development',
      PORT: 3000,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USERNAME: 'user',
      DB_PASSWORD: 'pass',
      DB_NAME: 'db',
      DB_SSL: false,
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN_SECONDS: 3600,
      PASSWORD_PEPPER: 'pepper',
    });

    const config = buildAppConfig();

    expect(config).toEqual({
      nodeEnv: 'development',
      port: 3000,
    });
    expect(getValidatedEnvironment).toHaveBeenCalled();
  });

  it('should build app config with production environment', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      NODE_ENV: 'production',
      PORT: 8080,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USERNAME: 'user',
      DB_PASSWORD: 'pass',
      DB_NAME: 'db',
      DB_SSL: true,
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN_SECONDS: 3600,
      PASSWORD_PEPPER: 'pepper',
    });

    const config = buildAppConfig();

    expect(config).toEqual({
      nodeEnv: 'production',
      port: 8080,
    });
  });

  it('should build app config with test environment', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      NODE_ENV: 'test',
      PORT: 3001,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USERNAME: 'user',
      DB_PASSWORD: 'pass',
      DB_NAME: 'db',
      DB_SSL: false,
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN_SECONDS: 3600,
      PASSWORD_PEPPER: 'pepper',
    });

    const config = buildAppConfig();

    expect(config).toEqual({
      nodeEnv: 'test',
      port: 3001,
    });
  });
});
