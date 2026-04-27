import { Controller, Get } from '@nestjs/common';

import { GlossaryService, PublicGlossaryResponse } from './glossary.service';

@Controller('public/glossary')
export class GlossaryController {
  constructor(private readonly glossaryService: GlossaryService) {}

  @Get()
  async getPublicGlossary(): Promise<PublicGlossaryResponse> {
    return await this.glossaryService.getPublicGlossary();
  }
}
