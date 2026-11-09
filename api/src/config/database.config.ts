import { registerAs } from '@nestjs/config';

import {
  EnvironmentVariables,
  getValidatedEnvironment,
} from './env.validation';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

export function buildDatabaseConfig(
  env: EnvironmentVariables = getValidatedEnvironment(),
): DatabaseConfig {
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
