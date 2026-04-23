import { Module } from '@nestjs/common';

import { AuditLogWriterRepository } from './audit-log-writer.repository';
import { AuditLogWriterService } from './audit-log-writer.service';

@Module({
  providers: [AuditLogWriterRepository, AuditLogWriterService],
  exports: [AuditLogWriterService],
})
export class AuditModule {}
