import { Module } from '@nestjs/common';

import { GlossaryController } from './glossary.controller';
import { GlossaryRepository } from './glossary.repository';
import { GlossaryService } from './glossary.service';

@Module({
  controllers: [GlossaryController],
  providers: [GlossaryRepository, GlossaryService],
  exports: [GlossaryRepository, GlossaryService],
})
export class GlossaryModule {}
