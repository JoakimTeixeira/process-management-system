import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ItilPracticesModule } from '../itil_practices/itil-practices.module';
import { AreasController } from './areas.controller';
import { AreasRepository } from './areas.repository';
import { AreasService } from './areas.service';

@Module({
  imports: [AuthModule, AuditModule, ItilPracticesModule],
  controllers: [AreasController],
  providers: [AreasRepository, AreasService],
})
export class AreasModule {}
