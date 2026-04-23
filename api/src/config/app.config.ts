import { registerAs } from '@nestjs/config';

import { getValidatedEnvironment } from './env.validation';

export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
}

export function buildAppConfig(): AppConfig {
  const env = getValidatedEnvironment();

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
  };
}

export default registerAs('app', buildAppConfig);
