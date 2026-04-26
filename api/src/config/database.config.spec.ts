import { buildDatabaseConfig } from './database.config';
import { getValidatedEnvironment } from './env.validation';

jest.mock('./env.validation');

describe('database.config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build database config from environment', () => {
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

    const config = buildDatabaseConfig();

    expect(config).toEqual({
      host: 'localhost',
      port: 5432,
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
      PORT: 8080,
      DB_HOST: 'prod-db.example.com',
      DB_PORT: 5432,
      DB_USERNAME: 'produser',
      DB_PASSWORD: 'prodpass',
      DB_NAME: 'proddb',
      DB_SSL: true,
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN_SECONDS: 3600,
      PASSWORD_PEPPER: 'pepper',
    });

    const config = buildDatabaseConfig();

    expect(config).toEqual({
      host: 'prod-db.example.com',
      port: 5432,
      username: 'produser',
      password: 'prodpass',
      database: 'proddb',
      ssl: true,
    });
  });

  it('should build database config with custom port', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      NODE_ENV: 'development',
      PORT: 3000,
      DB_HOST: 'localhost',
      DB_PORT: 5433,
      DB_USERNAME: 'user',
      DB_PASSWORD: 'pass',
      DB_NAME: 'db',
      DB_SSL: false,
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN_SECONDS: 3600,
      PASSWORD_PEPPER: 'pepper',
    });

    const config = buildDatabaseConfig();

    expect(config).toEqual({
      host: 'localhost',
      port: 5433,
      username: 'user',
      password: 'pass',
      database: 'db',
      ssl: false,
    });
  });
});
