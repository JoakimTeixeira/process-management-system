import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { AreasModule } from '../../modules/areas/areas.module';
import { AssetsModule } from '../../modules/assets/assets.module';
import { AuditModule } from '../../modules/audit/audit.module';
import { AuthModule } from '../../modules/auth/auth.module';
import { GlossaryModule } from '../../modules/glossary/glossary.module';
import { HealthModule } from '../../modules/health/health.module';
import { ItilPracticesModule } from '../../modules/itil_practices/itil-practices.module';
import { ProceduresModule } from '../../modules/procedures/procedures.module';
import { ProcessesModule } from '../../modules/processes/processes.module';
import { ProcessVersionsModule } from '../../modules/process_versions/process-versions.module';
import { PublicPortalModule } from '../../modules/public_portal/public-portal.module';
import { TeamsModule } from '../../modules/teams/teams.module';
import { UsersModule } from '../../modules/users/users.module';
import {
  SWAGGER_BEARER_AUTH_NAME,
  SWAGGER_DOCS_PATH,
} from './swagger.constants';

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
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
    .addTag(
      'public',
      'Public portal catalogue, search, and published process content.',
    )
    .addTag('processes', 'Process records owned by teams and areas.')
    .addTag(
      'procedures',
      'Operational procedures attached to governed process versions.',
    )
    .addTag('teams', 'Team administration and active-selection endpoints.')
    .addTag(
      'users',
      'Technical user-management endpoints for access administration.',
    )
    .addTag(
      'versions',
      'Lifecycle-managed process versions and governance actions.',
    )
    .build();

  return SwaggerModule.createDocument(app, swaggerConfig, {
    include: [
      AuthModule,
      UsersModule,
      AreasModule,
      ItilPracticesModule,
      GlossaryModule,
      PublicPortalModule,
      ProcessesModule,
      ProcessVersionsModule,
      ProceduresModule,
      TeamsModule,
      AssetsModule,
      AuditModule,
      HealthModule,
    ],
    deepScanRoutes: true,
  });
}

export function setupSwagger(
  app: INestApplication,
  document: OpenAPIObject,
): void {
  SwaggerModule.setup(SWAGGER_DOCS_PATH, app, document, {
    customSiteTitle: 'Process Management System API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
