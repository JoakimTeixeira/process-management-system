import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AuditController } from './audit.controller';
import { AuditReaderRepository } from './audit-reader.repository';
import { AuditReaderService } from './audit-reader.service';
import { AuditLogWriterRepository } from './audit-log-writer.repository';
import { AuditLogWriterService } from './audit-log-writer.service';

@Module({
  imports: [AuthModule],
  controllers: [AuditController],
  providers: [
    AuditLogWriterRepository,
    AuditLogWriterService,
    AuditReaderRepository,
    AuditReaderService,
  ],
  exports: [AuditLogWriterService],
})
export class AuditModule {}
