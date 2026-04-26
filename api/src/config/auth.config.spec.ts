import { buildAuthConfig } from './auth.config';
import { getValidatedEnvironment } from './env.validation';

import {
  DEFAULT_DB_PORT,
  DEFAULT_PORT,
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from '../common/constants/workflow.constants';

jest.mock('./env.validation');

describe('auth.config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build auth config from environment', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      NODE_ENV: 'development',
      PORT: DEFAULT_PORT,
      DB_HOST: 'localhost',
      DB_PORT: DEFAULT_DB_PORT,
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
      jwtExpiresInSeconds: 15 * SECONDS_PER_MINUTE,
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

    expect(config.jwtExpiresInSeconds).toBe(15 * SECONDS_PER_MINUTE);
  });

  it('should parse JWT expiration in hours', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      AUTH_PASSWORD_PEPPER: 'pepper',
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN: '2h',
    });

    const config = buildAuthConfig();

    expect(config.jwtExpiresInSeconds).toBe(2 * SECONDS_PER_HOUR);
  });

  it('should parse JWT expiration in days', () => {
    (getValidatedEnvironment as jest.Mock).mockReturnValue({
      AUTH_PASSWORD_PEPPER: 'pepper',
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN: '1d',
    });

    const config = buildAuthConfig();

    expect(config.jwtExpiresInSeconds).toBe(SECONDS_PER_DAY);
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
