import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ProcessVersionsModule } from '../process_versions/process-versions.module';
import { WorkflowSupportModule } from '../workflow_support/workflow-support.module';
import { ProceduresController } from './procedures.controller';
import { ProceduresRepository } from './procedures.repository';
import { ProceduresService } from './procedures.service';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    WorkflowSupportModule,
    ProcessVersionsModule,
  ],
  controllers: [ProceduresController],
  providers: [ProceduresRepository, ProceduresService],
  exports: [ProceduresRepository, ProceduresService],
})
export class ProceduresModule {}
