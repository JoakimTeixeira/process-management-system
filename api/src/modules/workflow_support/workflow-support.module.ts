import { Module } from '@nestjs/common';

import { WorkflowAuthorizationRepository } from './workflow-authorization.repository';
import { WorkflowAuthorizationService } from './workflow-authorization.service';

@Module({
  providers: [WorkflowAuthorizationRepository, WorkflowAuthorizationService],
  exports: [WorkflowAuthorizationRepository, WorkflowAuthorizationService],
})
export class WorkflowSupportModule {}
