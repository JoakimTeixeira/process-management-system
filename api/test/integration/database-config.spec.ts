import {
  DEFAULT_INTEGRATION_DATABASE_NAME,
  assertSafeIntegrationDatabaseName,
  buildIntegrationDatabaseConfig,
} from './integration-database';

describe('integration database configuration', () => {
  const baseEnvironment: NodeJS.ProcessEnv = {
    DB_HOST: 'localhost',
    DB_PORT: '5431',
    DB_USERNAME: 'postgres',
    DB_PASSWORD: 'secret',
    DB_NAME: 'process_management_system',
    DB_SSL: 'false',
  };

  it('should use a dedicated test-scoped database by default', () => {
    const config = buildIntegrationDatabaseConfig(baseEnvironment);

    expect(config).toEqual({
      host: 'localhost',
      port: 5431,
      username: 'postgres',
      password: 'secret',
      database: DEFAULT_INTEGRATION_DATABASE_NAME,
      ssl: false,
    });
    expect(config.database).not.toBe(baseEnvironment.DB_NAME);
  });

  it('should honor integration-specific connection overrides', () => {
    const config = buildIntegrationDatabaseConfig({
      ...baseEnvironment,
      INTEGRATION_DB_HOST: 'integration-db',
      INTEGRATION_DB_PORT: '5544',
      INTEGRATION_DB_USERNAME: 'integration-user',
      INTEGRATION_DB_PASSWORD: 'integration-password',
      INTEGRATION_DB_NAME: 'pms_test_isolated',
      INTEGRATION_DB_SSL: 'true',
    });

    expect(config).toEqual({
      host: 'integration-db',
      port: 5544,
      username: 'integration-user',
      password: 'integration-password',
      database: 'pms_test_isolated',
      ssl: true,
    });
  });

  it('should refuse database names that are not explicitly test-scoped', () => {
    for (const databaseName of [
      'process_management_system',
      'postgres',
      'contest',
      '',
    ]) {
      expect(() => assertSafeIntegrationDatabaseName(databaseName)).toThrow(
        /test-scoped/i,
      );
    }
  });

  it('should accept names with a distinct test marker', () => {
    for (const databaseName of [
      'process_management_system_test',
      'test_process_management_system',
      'process-management-testing-db',
    ]) {
      expect(() =>
        assertSafeIntegrationDatabaseName(databaseName),
      ).not.toThrow();
    }
  });
});
