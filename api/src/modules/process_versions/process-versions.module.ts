import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ProcessesModule } from '../processes/processes.module';
import { WorkflowSupportModule } from '../workflow_support/workflow-support.module';
import { ProcessVersionsController } from './process-versions.controller';
import { ProcessVersionsRepository } from './process-versions.repository';
import { ProcessVersionsService } from './process-versions.service';

@Module({
  imports: [AuthModule, AuditModule, WorkflowSupportModule, ProcessesModule],
  controllers: [ProcessVersionsController],
  providers: [ProcessVersionsRepository, ProcessVersionsService],
  exports: [ProcessVersionsRepository, ProcessVersionsService],
})
export class ProcessVersionsModule {}
