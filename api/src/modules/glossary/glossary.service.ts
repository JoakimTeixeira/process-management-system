import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { isUniqueViolationError } from '../../common/utils/postgres-error.util';
import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateGlossaryTermDto } from './dto/create-glossary-term.dto';
import { UpdateGlossaryTermDto } from './dto/update-glossary-term.dto';
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
  private static readonly DUPLICATE_TERM_MESSAGE =
    'A glossary term with this value already exists';
  private static readonly DUPLICATE_DEFINITION_MESSAGE =
    'A glossary term with this definition already exists';

  constructor(
    private readonly glossaryRepository: GlossaryRepository,
    private readonly auditLogWriterService: AuditLogWriterService,
  ) {}

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

  async listTerms(): Promise<GlossaryTermRecord[]> {
    return await this.glossaryRepository.listTerms();
  }

  async getById(id: string): Promise<GlossaryTermRecord> {
    const term = await this.glossaryRepository.findById(id);

    if (!term) {
      throw new NotFoundException('Glossary term not found');
    }

    return term;
  }

  async create(
    createDto: CreateGlossaryTermDto,
    currentUser: AuthenticatedUser,
  ): Promise<GlossaryTermRecord> {
    try {
      const term = await this.glossaryRepository.create({
        term: createDto.term,
        definition: createDto.definition,
        category: createDto.category ?? null,
        isPreferred: createDto.isPreferred ?? true,
        createdBy: currentUser.id,
      });

      await this.auditLogWriterService.create({
        entityType: 'glossary_term',
        entityId: term.id,
        action: 'CREATE',
        actorId: currentUser.id,
        reasonForChange: 'Created glossary term via API',
        newData: term,
      });

      return term;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(GlossaryService.DUPLICATE_TERM_MESSAGE);
      }

      throw error;
    }
  }

  async update(
    id: string,
    updateDto: UpdateGlossaryTermDto,
    currentUser: AuthenticatedUser,
  ): Promise<GlossaryTermRecord> {
    const currentTerm = await this.getById(id);

    if (Object.keys(updateDto).length === 0) {
      return currentTerm;
    }

    try {
      const updatedTerm = await this.glossaryRepository.update(id, {
        term: updateDto.term,
        definition: updateDto.definition,
        category: updateDto.category,
        isPreferred: updateDto.isPreferred,
      });

      await this.auditLogWriterService.create({
        entityType: 'glossary_term',
        entityId: updatedTerm.id,
        action: 'UPDATE',
        actorId: currentUser.id,
        reasonForChange: 'Updated glossary term via API',
        oldData: currentTerm,
        newData: updatedTerm,
      });

      return updatedTerm;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(GlossaryService.DUPLICATE_TERM_MESSAGE);
      }

      throw error;
    }
  }
}
