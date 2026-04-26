import { buildAuthConfig } from './auth.config';
import { getValidatedEnvironment } from './env.validation';

jest.mock('./env.validation');

describe('auth.config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build auth config from environment', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      NODE_ENV: 'development',
      PORT: 3000,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USERNAME: 'user',
      DB_PASSWORD: 'pass',
      DB_NAME: 'db',
      DB_SSL: false,
      AUTH_PASSWORD_PEPPER: 'pepper',
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN: '15m',
    });

    const config = buildAuthConfig();

    expect(config).toEqual({
      passwordPepper: 'pepper',
      jwtSecret: 'secret',
      jwtExpiresIn: '15m',
      jwtExpiresInSeconds: 900,
    });
    expect(getValidatedEnvironment).toHaveBeenCalled();
  });

  it('should parse JWT expiration in seconds', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      AUTH_PASSWORD_PEPPER: 'pepper',
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN: '30s',
    });

    const config = buildAuthConfig();

    expect(config.jwtExpiresInSeconds).toBe(30);
  });

  it('should parse JWT expiration in minutes', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      AUTH_PASSWORD_PEPPER: 'pepper',
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN: '15m',
    });

    const config = buildAuthConfig();

    expect(config.jwtExpiresInSeconds).toBe(900);
  });

  it('should parse JWT expiration in hours', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      AUTH_PASSWORD_PEPPER: 'pepper',
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN: '2h',
    });

    const config = buildAuthConfig();

    expect(config.jwtExpiresInSeconds).toBe(7200);
  });

  it('should parse JWT expiration in days', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      AUTH_PASSWORD_PEPPER: 'pepper',
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN: '1d',
    });

    const config = buildAuthConfig();

    expect(config.jwtExpiresInSeconds).toBe(86400);
  });

  it('should throw error for invalid JWT_EXPIRES_IN format', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      AUTH_PASSWORD_PEPPER: 'pepper',
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN: 'invalid',
    });

    expect(() => buildAuthConfig()).toThrow(
      'Invalid JWT_EXPIRES_IN value "invalid". Expected format like 15m.',
    );
  });

  it('should throw error for JWT_EXPIRES_IN without unit', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      AUTH_PASSWORD_PEPPER: 'pepper',
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN: '15',
    });

    expect(() => buildAuthConfig()).toThrow(
      'Invalid JWT_EXPIRES_IN value "15". Expected format like 15m.',
    );
  });
});
