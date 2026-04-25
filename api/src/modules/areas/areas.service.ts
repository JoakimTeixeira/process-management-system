import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { isUniqueViolationError } from '../../common/utils/postgres-error.util';
import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { CreateAreaDto } from './dto/create-area.dto';
import type { UpdateAreaDto } from './dto/update-area.dto';
import type { AreaRecord } from './areas.repository';
import { AreasRepository } from './areas.repository';
import { ItilPracticesService } from '../itil_practices/itil-practices.service';

@Injectable()
export class AreasService {
  private static readonly DUPLICATE_CODE_MESSAGE =
    'An Area with the same code already exists';

  constructor(
    private readonly areasRepository: AreasRepository,
    private readonly itilPracticesService: ItilPracticesService,
    private readonly auditLogWriterService: AuditLogWriterService,
  ) {}

  async create(
    createAreaDto: CreateAreaDto,
    currentUser: AuthenticatedUser,
  ): Promise<AreaRecord> {
    await this.ensureOwnerExists(createAreaDto.ownerId);
    await this.ensureItilPracticeExists(createAreaDto.itilPracticeId);

    const existingArea = await this.areasRepository.findByCode(
      createAreaDto.code,
    );

    if (existingArea) {
      throw new ConflictException(AreasService.DUPLICATE_CODE_MESSAGE);
    }

    try {
      const area = await this.areasRepository.create({
        code: createAreaDto.code,
        title: createAreaDto.title,
        description: createAreaDto.description ?? null,
        ownerId: createAreaDto.ownerId,
        itilPracticeId: createAreaDto.itilPracticeId,
        actorId: currentUser.id,
      });

      await this.auditLogWriterService.create({
        entityType: 'area',
        entityId: area.id,
        action: 'CREATE',
        actorId: currentUser.id,
        reasonForChange: 'Created area via API',
        newData: this.toAuditSnapshot(area),
      });

      return area;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(AreasService.DUPLICATE_CODE_MESSAGE);
      }

      throw error;
    }
  }

  async list(): Promise<AreaRecord[]> {
    return await this.areasRepository.findAll();
  }

  async getById(id: string): Promise<AreaRecord> {
    const area = await this.areasRepository.findById(id);

    if (!area) {
      throw new NotFoundException('Area not found');
    }

    return area;
  }

  async update(
    id: string,
    updateAreaDto: UpdateAreaDto,
    currentUser: AuthenticatedUser,
  ): Promise<AreaRecord> {
    const currentArea = await this.getById(id);

    if (updateAreaDto.code && updateAreaDto.code !== currentArea.code) {
      const areaWithSameCode = await this.areasRepository.findByCode(
        updateAreaDto.code,
      );

      if (areaWithSameCode) {
        throw new ConflictException(AreasService.DUPLICATE_CODE_MESSAGE);
      }
    }

    if (
      updateAreaDto.ownerId &&
      updateAreaDto.ownerId !== currentArea.ownerId
    ) {
      await this.ensureOwnerExists(updateAreaDto.ownerId);
    }

    if (
      updateAreaDto.itilPracticeId &&
      updateAreaDto.itilPracticeId !== currentArea.itilPracticeId
    ) {
      await this.ensureItilPracticeExists(updateAreaDto.itilPracticeId);
    }

    if (Object.keys(updateAreaDto).length === 0) {
      return currentArea;
    }

    try {
      const updatedArea = await this.areasRepository.update(
        id,
        {
          code: updateAreaDto.code,
          title: updateAreaDto.title,
          description: updateAreaDto.description,
          ownerId: updateAreaDto.ownerId,
          itilPracticeId: updateAreaDto.itilPracticeId,
        },
        currentUser.id,
      );

      await this.auditLogWriterService.create({
        entityType: 'area',
        entityId: updatedArea.id,
        action: 'UPDATE',
        actorId: currentUser.id,
        reasonForChange: 'Updated area via API',
        oldData: this.toAuditSnapshot(currentArea),
        newData: this.toAuditSnapshot(updatedArea),
      });

      return updatedArea;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(AreasService.DUPLICATE_CODE_MESSAGE);
      }

      throw error;
    }
  }

  async delete(id: string, currentUser: AuthenticatedUser): Promise<void> {
    const currentArea = await this.getById(id);

    await this.areasRepository.delete(id);
    await this.auditLogWriterService.create({
      entityType: 'area',
      entityId: currentArea.id,
      action: 'DELETE',
      actorId: currentUser.id,
      reasonForChange: 'Deleted area via API',
      oldData: this.toAuditSnapshot(currentArea),
    });
  }

  private async ensureOwnerExists(ownerId: string): Promise<void> {
    const ownerExists = await this.areasRepository.ownerExists(ownerId);

    if (!ownerExists) {
      throw new NotFoundException('Owner not found');
    }
  }

  private async ensureItilPracticeExists(
    itilPracticeId: string,
  ): Promise<void> {
    const practice = await this.itilPracticesService.findById(itilPracticeId);

    if (!practice) {
      throw new NotFoundException('ITIL practice not found');
    }
  }

  private toAuditSnapshot(area: AreaRecord): Record<string, unknown> {
    return {
      id: area.id,
      code: area.code,
      title: area.title,
      description: area.description,
      ownerId: area.ownerId,
      itilPracticeId: area.itilPracticeId,
      itilPractice: {
        id: area.itilPracticeId,
        name: area.itilPracticeName,
      },
    };
  }
}
