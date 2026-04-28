import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  SWAGGER_BEARER_AUTH_NAME,
  SWAGGER_DOCS_PATH,
} from './common/swagger/swagger.constants';
import { buildAppConfig } from './config/app.config';
import { AreasModule } from './modules/areas/areas.module';
import { AssetsModule } from './modules/assets/assets.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { GlossaryModule } from './modules/glossary/glossary.module';
import { HealthModule } from './modules/health/health.module';
import { ItilPracticesModule } from './modules/itil_practices/itil-practices.module';
import { ProcessVersionsModule } from './modules/process_versions/process-versions.module';
import { ProcessesModule } from './modules/processes/processes.module';
import { ProceduresModule } from './modules/procedures/procedures.module';
import { UsersModule } from './modules/users/users.module';

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Process Management System API')
    .setDescription(
      'OpenAPI documentation for the Process Management System backoffice, governance workflows, master data, audit trails, and operational health checks.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Paste a valid JWT access token to test protected backoffice endpoints.',
      },
      SWAGGER_BEARER_AUTH_NAME,
    )
    .addTag('areas', 'Business capability areas managed by the backoffice.')
    .addTag('assets', 'BPMN and related files attached to process versions.')
    .addTag('audit', 'Audit logs and lifecycle history for governed records.')
    .addTag('auth', 'Authentication and current-user identity endpoints.')
    .addTag(
      'glossary',
      'Glossary term management and public catalogue content.',
    )
    .addTag('health', 'Operational health probes for the API.')
    .addTag(
      'itil_practices',
      'ITIL practice reference data used across the process catalogue.',
    )
    .addTag('processes', 'Process records owned by teams and areas.')
    .addTag(
      'procedures',
      'Operational procedures attached to governed process versions.',
    )
    .addTag(
      'teams',
      'Team selection endpoints exposed through technical user management.',
    )
    .addTag(
      'users',
      'Technical user-management endpoints for access administration.',
    )
    .addTag(
      'versions',
      'Lifecycle-managed process versions and governance actions.',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    include: [
      AuthModule,
      UsersModule,
      AreasModule,
      ItilPracticesModule,
      GlossaryModule,
      ProcessesModule,
      ProcessVersionsModule,
      ProceduresModule,
      AssetsModule,
      AuditModule,
      HealthModule,
    ],
    deepScanRoutes: true,
  });

  SwaggerModule.setup(SWAGGER_DOCS_PATH, app, swaggerDocument, {
    customSiteTitle: 'Process Management System API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(port);
}

void bootstrap();
