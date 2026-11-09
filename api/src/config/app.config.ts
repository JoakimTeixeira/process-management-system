import { registerAs } from '@nestjs/config';

import {
  EnvironmentVariables,
  getValidatedEnvironment,
} from './env.validation';

export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
}

export function buildAppConfig(
  env: EnvironmentVariables = getValidatedEnvironment(),
): AppConfig {
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
  };
}

export default registerAs('app', buildAppConfig);
