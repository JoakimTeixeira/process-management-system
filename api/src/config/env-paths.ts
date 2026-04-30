import { basename, resolve } from 'node:path';

import { config as loadDotEnv } from 'dotenv';

function getProjectRoot(currentDir: string): string {
  return basename(currentDir).toLowerCase() === 'api'
    ? resolve(currentDir, '..')
    : currentDir;
}

export function getEnvFilePaths(
  currentDir = process.cwd(),
  nodeEnv = process.env.NODE_ENV ?? 'development',
): string[] {
  const projectRoot = getProjectRoot(currentDir);

  return [
    resolve(projectRoot, `.env.${nodeEnv}.local`),
    resolve(projectRoot, `.env.${nodeEnv}`),
    resolve(projectRoot, '.env.local'),
    resolve(projectRoot, '.env'),
  ];
}

export function loadProjectEnvironment(currentDir = process.cwd()): void {
  for (const path of getEnvFilePaths(currentDir)) {
    loadDotEnv({
      path,
      override: false,
      quiet: true,
    });
  }
}
