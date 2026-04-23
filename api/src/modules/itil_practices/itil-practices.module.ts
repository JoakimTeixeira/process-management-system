import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ItilPracticesController } from './itil-practices.controller';
import { ItilPracticesRepository } from './itil-practices.repository';
import { ItilPracticesService } from './itil-practices.service';

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [ItilPracticesController],
  providers: [ItilPracticesRepository, ItilPracticesService],
  exports: [ItilPracticesService],
})
export class ItilPracticesModule {}
