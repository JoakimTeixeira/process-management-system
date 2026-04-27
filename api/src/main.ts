import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { buildAppConfig } from './config/app.config';

async function bootstrap() {
  const { nodeEnv, port } = buildAppConfig();
  const app = await NestFactory.create(AppModule, {
    logger:
      nodeEnv === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  if (nodeEnv !== 'production') {
    app.enableCors({
      origin: (
        origin: string | undefined,
        callback: (error: Error | null, allow: boolean) => void,
      ) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        try {
          const { hostname } = new URL(origin);
          const isLocalOrigin =
            hostname === 'localhost' || hostname === '127.0.0.1';

          callback(null, isLocalOrigin);
        } catch {
          callback(null, false);
        }
      },
    });
  }

  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(port);
}

void bootstrap();
