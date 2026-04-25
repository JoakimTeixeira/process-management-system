import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ProcessVersionsModule } from '../process_versions/process-versions.module';
import { WorkflowSupportModule } from '../workflow_support/workflow-support.module';
import { AssetsController } from './assets.controller';
import { AssetsRepository } from './assets.repository';
import { AssetsService } from './assets.service';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    WorkflowSupportModule,
    ProcessVersionsModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsRepository, AssetsService],
})
export class AssetsModule {}
