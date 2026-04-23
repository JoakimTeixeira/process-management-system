import { ConflictException, Injectable } from '@nestjs/common';

import { isUniqueViolationError } from '../../common/utils/postgres-error.util';
import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { CreateItilPracticeDto } from './dto/create-itil-practice.dto';
import type { ItilPracticeRecord } from './itil-practices.repository';
import { ItilPracticesRepository } from './itil-practices.repository';

@Injectable()
export class ItilPracticesService {
  constructor(
    private readonly itilPracticesRepository: ItilPracticesRepository,
    private readonly auditLogWriterService: AuditLogWriterService,
  ) {}

  async create(
    createItilPracticeDto: CreateItilPracticeDto,
    currentUser: AuthenticatedUser,
  ): Promise<ItilPracticeRecord> {
    const existingPractice =
      await this.itilPracticesRepository.findByCodeOrName(
        createItilPracticeDto.code,
        createItilPracticeDto.name,
      );

    if (existingPractice) {
      throw new ConflictException(
        'An ITIL practice with the same code or name already exists',
      );
    }

    try {
      const practice = await this.itilPracticesRepository.create({
        code: createItilPracticeDto.code,
        name: createItilPracticeDto.name,
        description: createItilPracticeDto.description ?? null,
      });

      await this.auditLogWriterService.create({
        entityType: 'itil_practice',
        entityId: practice.id,
        action: 'CREATE',
        actorId: currentUser.id,
        reasonForChange: 'Created ITIL practice via API',
        newData: practice,
      });

      return practice;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(
          'An ITIL practice with the same code or name already exists',
        );
      }

      throw error;
    }
  }

  async list(): Promise<ItilPracticeRecord[]> {
    return await this.itilPracticesRepository.findAll();
  }

  async findById(id: string): Promise<ItilPracticeRecord | null> {
    return await this.itilPracticesRepository.findById(id);
  }
}
