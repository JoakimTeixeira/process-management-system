import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Role } from '../../common/enums/role.enum';
import { isUniqueViolationError } from '../../common/utils/postgres-error.util';
import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
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
    private readonly workflowAuthorizationService: WorkflowAuthorizationService,
    private readonly auditLogWriterService: AuditLogWriterService,
  ) {}

  async create(
    createAreaDto: CreateAreaDto,
    currentUser: AuthenticatedUser,
  ): Promise<AreaRecord> {
    this.assertEditorRole(currentUser);
    await this.ensureTeamExists(createAreaDto.teamId);
    await this.ensureOwnerExists(createAreaDto.ownerId);
    await this.ensureOwnerBelongsToTeam(
      createAreaDto.ownerId,
      createAreaDto.teamId,
    );
    await this.workflowAuthorizationService.assertSameTeamAsUser(
      createAreaDto.ownerId,
      currentUser,
    );
    await this.ensureItilPracticeExists(createAreaDto.itilPracticeId);
    const nextCode = await this.areasRepository.getNextAreaCode();

    const trimmedDescription = createAreaDto.description?.trim();
    if (!trimmedDescription) {
      throw new BadRequestException('Description cannot be blank');
    }

    try {
      const area = await this.areasRepository.create({
        code: nextCode,
        title: createAreaDto.title,
        description: trimmedDescription,
        teamId: createAreaDto.teamId,
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
    this.assertEditorRole(currentUser);
    const currentArea = await this.getById(id);

    this.validateCodeNotModified(updateAreaDto);
    await this.validateTeamAndOwnerChanges(updateAreaDto, currentArea);
    await this.validateItilPracticeChange(updateAreaDto, currentArea);
    await this.validateTeamAuthorization(
      updateAreaDto,
      currentArea,
      currentUser,
    );

    if (Object.keys(updateAreaDto).length === 0) {
      return currentArea;
    }

    return await this.performUpdate(
      id,
      updateAreaDto,
      currentArea,
      currentUser,
    );
  }

  async delete(id: string, currentUser: AuthenticatedUser): Promise<void> {
    this.assertEditorRole(currentUser);
    const currentArea = await this.getById(id);

    await this.workflowAuthorizationService.assertSameTeamAsUser(
      currentArea.ownerId,
      currentUser,
    );

    const hasProcesses = await this.areasRepository.hasProcesses(id);
    if (hasProcesses) {
      throw new ConflictException(
        'Cannot delete area that contains processes. Delete or move all processes first.',
      );
    }

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

  private async ensureTeamExists(teamId: string): Promise<void> {
    const teamExists = await this.areasRepository.teamExists(teamId);

    if (!teamExists) {
      throw new NotFoundException('Team not found');
    }
  }

  private async ensureOwnerBelongsToTeam(
    ownerId: string,
    teamId: string,
  ): Promise<void> {
    const belongsToTeam = await this.areasRepository.userBelongsToTeam(
      ownerId,
      teamId,
    );

    if (!belongsToTeam) {
      throw new BadRequestException('Owner must belong to the specified team');
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

  private assertEditorRole(currentUser: AuthenticatedUser): void {
    if (currentUser.role !== Role.EDITOR) {
      throw new ForbiddenException('Only editors can manage areas');
    }
  }

  private validateCodeNotModified(updateAreaDto: UpdateAreaDto): void {
    const rawUpdateAreaDto = updateAreaDto as UpdateAreaDto & {
      code?: unknown;
    };

    if ('code' in rawUpdateAreaDto) {
      throw new BadRequestException(
        'Area code is generated by the backend and cannot be changed',
      );
    }
  }

  private async validateTeamAndOwnerChanges(
    updateAreaDto: UpdateAreaDto,
    currentArea: AreaRecord,
  ): Promise<void> {
    if (updateAreaDto.teamId && updateAreaDto.teamId !== currentArea.teamId) {
      await this.ensureTeamExists(updateAreaDto.teamId);
    }

    if (
      updateAreaDto.ownerId &&
      updateAreaDto.ownerId !== currentArea.ownerId
    ) {
      await this.ensureOwnerExists(updateAreaDto.ownerId);
    }

    if (updateAreaDto.teamId && updateAreaDto.ownerId) {
      await this.ensureOwnerBelongsToTeam(
        updateAreaDto.ownerId,
        updateAreaDto.teamId,
      );
    } else if (updateAreaDto.teamId && !updateAreaDto.ownerId) {
      await this.ensureOwnerBelongsToTeam(
        currentArea.ownerId,
        updateAreaDto.teamId,
      );
    } else if (!updateAreaDto.teamId && updateAreaDto.ownerId) {
      await this.ensureOwnerBelongsToTeam(
        updateAreaDto.ownerId,
        currentArea.teamId,
      );
    }
  }

  private async validateItilPracticeChange(
    updateAreaDto: UpdateAreaDto,
    currentArea: AreaRecord,
  ): Promise<void> {
    if (
      updateAreaDto.itilPracticeId &&
      updateAreaDto.itilPracticeId !== currentArea.itilPracticeId
    ) {
      await this.ensureItilPracticeExists(updateAreaDto.itilPracticeId);
    }
  }

  private async validateTeamAuthorization(
    updateAreaDto: UpdateAreaDto,
    currentArea: AreaRecord,
    currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.workflowAuthorizationService.assertSameTeamAsUser(
      updateAreaDto.ownerId ?? currentArea.ownerId,
      currentUser,
    );
  }

  private async performUpdate(
    id: string,
    updateAreaDto: UpdateAreaDto,
    currentArea: AreaRecord,
    currentUser: AuthenticatedUser,
  ): Promise<AreaRecord> {
    try {
      const updatedArea = await this.areasRepository.update(
        id,
        {
          title: updateAreaDto.title,
          description: updateAreaDto.description,
          teamId: updateAreaDto.teamId,
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
}
