import { registerAs } from '@nestjs/config';

import { getValidatedEnvironment } from './env.validation';
import {
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from '../common/constants/workflow.constants';

export interface AuthConfig {
  passwordPepper: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtExpiresInSeconds: number;
}

const JWT_EXPIRATION_UNITS: Record<string, number> = {
  s: 1,
  m: SECONDS_PER_MINUTE,
  h: SECONDS_PER_HOUR,
  d: SECONDS_PER_DAY,
};

function parseJwtExpiresIn(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);

  if (!match) {
    throw new Error(
      `Invalid JWT_EXPIRES_IN value "${value}". Expected format like 15m.`,
    );
  }

  const amount = Number(match[1]);
  const unitMultiplier = JWT_EXPIRATION_UNITS[match[2]];

  return amount * unitMultiplier;
}

export function buildAuthConfig(): AuthConfig {
  const env = getValidatedEnvironment();

  return {
    passwordPepper: env.AUTH_PASSWORD_PEPPER,
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    jwtExpiresInSeconds: parseJwtExpiresIn(env.JWT_EXPIRES_IN),
  };
}

export default registerAs('auth', buildAuthConfig);
