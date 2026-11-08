import { spawn } from 'node:child_process';
import { basename } from 'node:path';

export interface SwaggerLauncherCommand {
  command: string;
  args: string[];
}

export function resolveSwaggerOpenCommand(
  platform: NodeJS.Platform,
  url: string,
): SwaggerLauncherCommand {
  if (platform === 'win32') {
    return {
      command: 'cmd',
      args: ['/c', 'start', '', url],
    };
  }
  if (platform === 'darwin') {
    return {
      command: 'open',
      args: [url],
    };
  }
  return {
    command: 'xdg-open',
    args: [url],
  };
}

export function openSwaggerUrl({
  environment = process.env,
  platform = process.platform,
  spawnImpl = spawn,
}: {
  environment?: NodeJS.ProcessEnv;
  platform?: NodeJS.Platform;
  spawnImpl?: typeof spawn;
} = {}): string {
  const port = environment.PORT || '3000';
  const swaggerPath = environment.SWAGGER_PATH || 'docs';
  const swaggerUrl = `http://localhost:${port}/${swaggerPath}`;
  const { command, args } = resolveSwaggerOpenCommand(platform, swaggerUrl);

  const child = spawnImpl(command, args, {
    detached: true,
    stdio: 'ignore',
  });

  child.unref();
  return swaggerUrl;
}

if (basename(process.argv[1] ?? '') === 'open-swagger.ts') {
  openSwaggerUrl();
}
