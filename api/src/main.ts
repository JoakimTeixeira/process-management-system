import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { buildAppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { port } = buildAppConfig();
  await app.listen(port);
}

void bootstrap();
