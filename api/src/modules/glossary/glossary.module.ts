import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { GlossaryController } from './glossary.controller';
import { GlossaryRepository } from './glossary.repository';
import { GlossaryService } from './glossary.service';

@Module({
  imports: [AuditModule],
  controllers: [GlossaryController],
  providers: [GlossaryRepository, GlossaryService],
  exports: [GlossaryRepository, GlossaryService],
})
export class GlossaryModule {}
