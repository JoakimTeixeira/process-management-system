import { Injectable } from '@nestjs/common';

import {
  GlossaryPracticeRecord,
  GlossaryRepository,
  GlossaryTermRecord,
} from './glossary.repository';

export type PublicGlossaryResponse = {
  terms: GlossaryTermRecord[];
  practices: GlossaryPracticeRecord[];
};

@Injectable()
export class GlossaryService {
  constructor(private readonly glossaryRepository: GlossaryRepository) {}

  async getPublicGlossary(): Promise<PublicGlossaryResponse> {
    const [terms, practices] = await Promise.all([
      this.glossaryRepository.listTerms(),
      this.glossaryRepository.listPractices(),
    ]);

    return {
      terms,
      practices,
    };
  }
}
