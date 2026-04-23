import { registerAs } from '@nestjs/config';

import { getValidatedEnvironment } from './env.validation';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

export function buildDatabaseConfig(): DatabaseConfig {
  const env = getValidatedEnvironment();

  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: env.DB_SSL,
  };
}

export default registerAs('database', buildDatabaseConfig);
