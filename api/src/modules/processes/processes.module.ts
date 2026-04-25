import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { WorkflowSupportModule } from '../workflow_support/workflow-support.module';
import { ProcessesController } from './processes.controller';
import { ProcessesRepository } from './processes.repository';
import { ProcessesService } from './processes.service';

@Module({
  imports: [AuthModule, AuditModule, WorkflowSupportModule],
  controllers: [ProcessesController],
  providers: [ProcessesRepository, ProcessesService],
  exports: [ProcessesRepository, ProcessesService],
})
export class ProcessesModule {}
