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
import type { CreateProcessDto } from './dto/create-process.dto';
import type { UpdateProcessDto } from './dto/update-process.dto';
import type { ProcessRecord } from './processes.repository';
import { ProcessesRepository } from './processes.repository';

@Injectable()
export class ProcessesService {
  private static readonly DUPLICATE_CODE_MESSAGE =
    'A Process with the same code already exists';

  constructor(
    private readonly processesRepository: ProcessesRepository,
    private readonly workflowAuthorizationService: WorkflowAuthorizationService,
    private readonly auditLogWriterService: AuditLogWriterService,
  ) {}

  async create(
    createProcessDto: CreateProcessDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessRecord> {
    this.assertEditorRole(currentUser);
    await this.ensureTeamExists(createProcessDto.teamId);
    await this.ensureOwnerExists(createProcessDto.ownerId);
    await this.ensureOwnerBelongsToTeam(
      createProcessDto.ownerId,
      createProcessDto.teamId,
    );
    await this.ensureAreaExists(createProcessDto.areaId);
    await this.workflowAuthorizationService.assertSameTeamAsUser(
      createProcessDto.ownerId,
      currentUser,
    );

    const nextCode: string =
      await this.processesRepository.getNextProcessCode();

    try {
      const process = await this.processesRepository.create({
        areaId: createProcessDto.areaId,
        code: nextCode,
        title: createProcessDto.title,
        description: createProcessDto.description,
        teamId: createProcessDto.teamId,
        ownerId: createProcessDto.ownerId,
        actorId: currentUser.id,
      });

      await this.auditLogWriterService.create({
        entityType: 'process',
        entityId: process.id,
        action: 'CREATE',
        actorId: currentUser.id,
        reasonForChange: 'Created process via API',
        newData: process,
      });

      return process;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(ProcessesService.DUPLICATE_CODE_MESSAGE);
      }

      throw error;
    }
  }

  async list(): Promise<ProcessRecord[]> {
    const processes =
      await this.processesRepository.findAllWithGovernanceSummary();

    return processes.map((process) => this.enrichGovernanceSummary(process));
  }

  private enrichGovernanceSummary(process: ProcessRecord): ProcessRecord {
    if (!process.governanceSummary) {
      return process;
    }

    const { activeWorkflowVersion } = process.governanceSummary;

    if (activeWorkflowVersion) {
      const { waitingForRole, nextAction } = this.mapStateToGovernanceAction(
        activeWorkflowVersion.lifecycleState,
        activeWorkflowVersion.architectureState,
      );

      process.governanceSummary.activeWorkflowVersion = {
        ...activeWorkflowVersion,
        waitingForRole,
        nextAction,
      };
    }

    return process;
  }

  private mapStateToGovernanceAction(
    lifecycleState: string,
    architectureState: string,
  ): { waitingForRole: string | null; nextAction: string | null } {
    switch (lifecycleState) {
      case 'Draft':
        return { waitingForRole: 'EDITOR', nextAction: 'Submit for Review' };
      case 'In Review':
        return { waitingForRole: 'REVIEWER', nextAction: 'Approve or Reject' };
      case 'Approved':
        return { waitingForRole: 'PUBLISHER', nextAction: 'Publish' };
      case 'Published':
        if (architectureState === 'TO-BE') {
          return {
            waitingForRole: null,
            nextAction: 'Promote to AS-IS (available to PUBLISHER)',
          };
        }
        return { waitingForRole: null, nextAction: null };
      case 'Archived':
        return { waitingForRole: null, nextAction: null };
      default:
        return { waitingForRole: null, nextAction: null };
    }
  }

  async getById(id: string): Promise<ProcessRecord> {
    const process = await this.processesRepository.findById(id);

    if (!process) {
      throw new NotFoundException('Process not found');
    }

    return process;
  }

  async update(
    id: string,
    updateProcessDto: UpdateProcessDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessRecord> {
    this.assertEditorRole(currentUser);
    const currentProcess = await this.getById(id);

    await this.workflowAuthorizationService.assertSameTeamAsProcessOwner(
      currentProcess.id,
      currentUser,
    );

    if (
      updateProcessDto.teamId &&
      updateProcessDto.teamId !== currentProcess.teamId
    ) {
      await this.ensureTeamExists(updateProcessDto.teamId);
    }

    if (
      updateProcessDto.ownerId &&
      updateProcessDto.ownerId !== currentProcess.ownerId
    ) {
      await this.ensureOwnerExists(updateProcessDto.ownerId);
    }

    if (updateProcessDto.teamId && updateProcessDto.ownerId) {
      await this.ensureOwnerBelongsToTeam(
        updateProcessDto.ownerId,
        updateProcessDto.teamId,
      );
    } else if (updateProcessDto.teamId && !updateProcessDto.ownerId) {
      await this.ensureOwnerBelongsToTeam(
        currentProcess.ownerId,
        updateProcessDto.teamId,
      );
    } else if (!updateProcessDto.teamId && updateProcessDto.ownerId) {
      await this.ensureOwnerBelongsToTeam(
        updateProcessDto.ownerId,
        currentProcess.teamId,
      );
    }

    if (
      updateProcessDto.areaId &&
      updateProcessDto.areaId !== currentProcess.areaId
    ) {
      await this.ensureAreaExists(updateProcessDto.areaId);
    }

    if (Object.keys(updateProcessDto).length === 0) {
      return currentProcess;
    }

    try {
      const updatedProcess = await this.processesRepository.update(
        id,
        {
          areaId: updateProcessDto.areaId,
          title: updateProcessDto.title,
          description: updateProcessDto.description,
          teamId: updateProcessDto.teamId,
          ownerId: updateProcessDto.ownerId,
        },
        currentUser.id,
      );

      await this.auditLogWriterService.create({
        entityType: 'process',
        entityId: updatedProcess.id,
        action: 'UPDATE',
        actorId: currentUser.id,
        reasonForChange: 'Updated process via API',
        oldData: currentProcess,
        newData: updatedProcess,
      });

      return updatedProcess;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(ProcessesService.DUPLICATE_CODE_MESSAGE);
      }

      throw error;
    }
  }

  async delete(id: string, currentUser: AuthenticatedUser): Promise<void> {
    this.assertEditorRole(currentUser);
    const process = await this.getById(id);

    await this.workflowAuthorizationService.assertSameTeamAsProcessOwner(
      process.id,
      currentUser,
    );

    await this.processesRepository.delete(id);
    await this.auditLogWriterService.create({
      entityType: 'process',
      entityId: process.id,
      action: 'DELETE',
      actorId: currentUser.id,
      reasonForChange: 'Deleted process via API',
      oldData: process,
    });
  }

  private async ensureOwnerExists(ownerId: string): Promise<void> {
    const ownerExists = await this.processesRepository.ownerExists(ownerId);

    if (!ownerExists) {
      throw new NotFoundException('Owner not found');
    }
  }

  private async ensureTeamExists(teamId: string): Promise<void> {
    const teamExists = await this.processesRepository.teamExists(teamId);

    if (!teamExists) {
      throw new NotFoundException('Team not found');
    }
  }

  private async ensureOwnerBelongsToTeam(
    ownerId: string,
    teamId: string,
  ): Promise<void> {
    const belongsToTeam = await this.processesRepository.userBelongsToTeam(
      ownerId,
      teamId,
    );

    if (!belongsToTeam) {
      throw new BadRequestException('Owner must belong to the specified team');
    }
  }

  private async ensureAreaExists(areaId: string): Promise<void> {
    const areaExists = await this.processesRepository.areaExists(areaId);

    if (!areaExists) {
      throw new NotFoundException('Area not found');
    }
  }

  private assertEditorRole(currentUser: AuthenticatedUser): void {
    if (currentUser.role !== Role.EDITOR) {
      throw new ForbiddenException('Only editors can manage processes');
    }
  }
}
