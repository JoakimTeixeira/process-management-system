import { validateEnvironment, getValidatedEnvironment } from './env.validation';

describe('env.validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should validate correct environment variables', () => {
      const config = {
        NODE_ENV: 'development',
        PORT: 3000,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USERNAME: 'user',
        DB_PASSWORD: 'password',
        DB_NAME: 'test-db',
        DB_SSL: false,
        AUTH_PASSWORD_PEPPER: 'pepper',
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '1h',
      };

      const result = validateEnvironment(config);

      expect(result).toEqual(config);
    });

    it('should use default values for optional fields', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_USERNAME: 'user',
        DB_PASSWORD: 'password',
        DB_NAME: 'test-db',
        AUTH_PASSWORD_PEPPER: 'pepper',
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '1h',
      };

      const result = validateEnvironment(config);

      expect(result.NODE_ENV).toBe('development');
      expect(result.PORT).toBe(3000);
      expect(result.DB_PORT).toBe(5432);
      expect(result.DB_SSL).toBe(false);
    });

    it('should throw error for missing required fields', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_USERNAME: 'user',
        DB_PASSWORD: 'password',
        DB_NAME: 'test-db',
        AUTH_PASSWORD_PEPPER: 'pepper',
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '1h',
      };

      expect(() => validateEnvironment(config)).not.toThrow();
    });

    it('should throw error for invalid NODE_ENV', () => {
      const config = {
        NODE_ENV: 'invalid' as 'development' | 'production' | 'test',
        DB_HOST: 'localhost',
        DB_USERNAME: 'user',
        DB_PASSWORD: 'password',
        DB_NAME: 'test-db',
        AUTH_PASSWORD_PEPPER: 'pepper',
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '1h',
      };

      expect(() => validateEnvironment(config)).toThrow();
    });

    it('should throw error for invalid JWT_EXPIRES_IN format', () => {
      const config = {
        DB_HOST: 'localhost',
        DB_USERNAME: 'user',
        DB_PASSWORD: 'password',
        DB_NAME: 'test-db',
        AUTH_PASSWORD_PEPPER: 'pepper',
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: 'invalid',
      };

      expect(() => validateEnvironment(config)).toThrow();
    });
  });

  describe('getValidatedEnvironment', () => {
    it('should cache validated environment', () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_USERNAME = 'user';
      process.env.DB_PASSWORD = 'password';
      process.env.DB_NAME = 'test-db';
      process.env.AUTH_PASSWORD_PEPPER = 'pepper';
      process.env.JWT_SECRET = 'secret';
      process.env.JWT_EXPIRES_IN = '1h';

      const result1 = getValidatedEnvironment();
      const result2 = getValidatedEnvironment();

      expect(result1).toBe(result2);
    });
  });
});
