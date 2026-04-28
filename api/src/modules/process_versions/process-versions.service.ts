import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import type { SqlExecutor } from '../../common/types/sql-executor.type';
import { isUniqueViolationError } from '../../common/utils/postgres-error.util';
import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ProcessesRepository } from '../processes/processes.repository';
import { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
import { ProcessVersionAction } from '../../common/enums/process-version-action.enum';
import { Role } from '../../common/enums/role.enum';
import type { CreateProcessVersionDto } from './dto/create-process-version.dto';
import type { LifecycleJustificationDto } from './dto/lifecycle-justification.dto';
import type { PromoteProcessVersionDto } from './dto/promote-process-version.dto';
import type { RequiredJustificationDto } from './dto/required-justification.dto';
import type { UpdateProcessVersionDto } from './dto/update-process-version.dto';
import type {
  CreateProcessVersionInput,
  ProcessVersionRecord,
} from './process-versions.repository';
import { ProcessVersionsRepository } from './process-versions.repository';

@Injectable()
export class ProcessVersionsService {
  private static readonly DUPLICATE_VERSION_MESSAGE =
    'A version with the same number already exists for this process';

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly processesRepository: ProcessesRepository,
    private readonly processVersionsRepository: ProcessVersionsRepository,
    private readonly workflowAuthorizationService: WorkflowAuthorizationService,
    private readonly auditLogWriterService: AuditLogWriterService,
  ) {}

  async create(
    processId: string,
    createProcessVersionDto: CreateProcessVersionDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionRecord> {
    this.assertRole(
      currentUser,
      Role.EDITOR,
      'Only editors can create process versions',
    );
    await this.ensureProcessExists(processId);
    await this.workflowAuthorizationService.assertSameTeamAsProcessOwner(
      processId,
      currentUser,
    );

    const derivedFromVersion = createProcessVersionDto.derivedFromVersionId
      ? await this.getByIdInternal(createProcessVersionDto.derivedFromVersionId)
      : null;

    if (derivedFromVersion && derivedFromVersion.processId !== processId) {
      throw new ConflictException(
        'derivedFromVersionId must reference a version of the same process',
      );
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const nextVersionNumber =
          await this.processVersionsRepository.getNextVersionNumber(
            processId,
            manager,
          );
        const createdVersion = await this.processVersionsRepository.create(
          this.toCreateInput(
            processId,
            createProcessVersionDto,
            currentUser.id,
            nextVersionNumber,
          ),
          manager,
        );

        await this.processVersionsRepository.insertStateHistory(
          {
            processVersionId: createdVersion.id,
            fromState: null,
            toState: 'Draft',
            actorId: currentUser.id,
            reason: 'Created version in Draft via API',
          },
          manager,
        );

        await this.auditLogWriterService.create(
          {
            entityType: 'process_version',
            entityId: createdVersion.id,
            action: 'CREATE',
            actorId: currentUser.id,
            reasonForChange: 'Created process version via API',
            newData: createdVersion,
          },
          manager,
        );

        return createdVersion;
      });
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(
          ProcessVersionsService.DUPLICATE_VERSION_MESSAGE,
        );
      }

      throw error;
    }
  }

  async listByProcessId(
    processId: string,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionRecord[]> {
    const process = await this.ensureProcessExists(processId);

    const versions =
      await this.processVersionsRepository.findByProcessId(processId);

    const editorCanManageDrafts = this.canManageDraftVersions(
      process.teamId,
      currentUser,
    );

    return versions.map((version) =>
      this.enrichWithAvailableActions(
        version,
        currentUser,
        editorCanManageDrafts,
      ),
    );
  }

  async getById(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionRecord> {
    const version = await this.getByIdInternal(id);
    const process = await this.ensureProcessExists(version.processId);

    return this.enrichWithAvailableActions(
      version,
      currentUser,
      this.canManageDraftVersions(process.teamId, currentUser),
    );
  }

  private async getByIdInternal(id: string): Promise<ProcessVersionRecord> {
    const version = await this.processVersionsRepository.findById(id);

    if (!version) {
      throw new NotFoundException('Process version not found');
    }

    return version;
  }

  private enrichWithAvailableActions(
    version: ProcessVersionRecord,
    currentUser: AuthenticatedUser,
    editorCanManageDrafts: boolean,
  ): ProcessVersionRecord {
    return {
      ...version,
      availableActions: this.getAvailableActions(
        currentUser.role,
        version.lifecycleState,
        version.architectureState,
        editorCanManageDrafts,
      ),
    };
  }

  private getAvailableActions(
    userRole: Role,
    lifecycleState: string,
    architectureState?: string,
    editorCanManageDrafts = false,
  ): ProcessVersionAction[] {
    const actions: ProcessVersionAction[] = [ProcessVersionAction.VIEW];

    // EDITOR
    if (
      userRole === Role.EDITOR &&
      editorCanManageDrafts &&
      lifecycleState === 'Draft'
    ) {
      actions.push(
        ProcessVersionAction.EDIT,
        ProcessVersionAction.UPLOAD_BPMN,
        ProcessVersionAction.MANAGE_CHECKLIST,
        ProcessVersionAction.SUBMIT_FOR_REVIEW,
      );
    }

    // REVIEWER
    if (userRole === Role.REVIEWER) {
      if (lifecycleState === 'In Review') {
        actions.push(ProcessVersionAction.APPROVE, ProcessVersionAction.REJECT);
      }

      if (lifecycleState === 'Approved') {
        actions.push(ProcessVersionAction.REOPEN);
      }
    }

    // PUBLISHER
    if (userRole === Role.PUBLISHER) {
      if (lifecycleState === 'Approved') {
        actions.push(ProcessVersionAction.PUBLISH);
      }

      if (lifecycleState === 'Published') {
        actions.push(ProcessVersionAction.ARCHIVE);

        if (architectureState === 'TO-BE') {
          actions.push(ProcessVersionAction.PROMOTE);
        }
      }
    }

    // VIEWER → only view
    // SYSTEM_ADMIN → no governance actions, only technical admin routes

    return actions;
  }

  async update(
    id: string,
    updateProcessVersionDto: UpdateProcessVersionDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionRecord> {
    this.assertRole(
      currentUser,
      Role.EDITOR,
      'Only editors can update process versions',
    );
    const currentVersion = await this.getByIdInternal(id);

    await this.workflowAuthorizationService.assertSameTeamAsProcessVersionOwner(
      id,
      currentUser,
    );
    this.ensureDraftLifecycle(
      currentVersion,
      'Only Draft versions can be updated',
    );

    if (updateProcessVersionDto.derivedFromVersionId) {
      const derivedFromVersion = await this.getByIdInternal(
        updateProcessVersionDto.derivedFromVersionId,
      );

      if (derivedFromVersion.processId !== currentVersion.processId) {
        throw new ConflictException(
          'derivedFromVersionId must reference a version of the same process',
        );
      }
    }

    if (Object.keys(updateProcessVersionDto).length === 0) {
      return currentVersion;
    }

    return await this.dataSource.transaction(async (manager) => {
      const updatedVersion = await this.processVersionsRepository.update(
        id,
        {
          architectureState: updateProcessVersionDto.architectureState,
          title: updateProcessVersionDto.title,
          checklistCompleted: updateProcessVersionDto.checklistCompleted,
          derivedFromVersionId: updateProcessVersionDto.derivedFromVersionId,
          changeDescription: updateProcessVersionDto.changeDescription,
          reasonForChange: updateProcessVersionDto.reasonForChange,
        },
        currentUser.id,
        manager,
      );

      await this.auditLogWriterService.create(
        {
          entityType: 'process_version',
          entityId: updatedVersion.id,
          action: 'UPDATE',
          actorId: currentUser.id,
          reasonForChange: 'Updated process version via API',
          oldData: currentVersion,
          newData: updatedVersion,
        },
        manager,
      );

      return updatedVersion;
    });
  }

  async delete(id: string, currentUser: AuthenticatedUser): Promise<void> {
    this.assertRole(
      currentUser,
      Role.EDITOR,
      'Only editors can delete process versions',
    );
    const version = await this.getByIdInternal(id);

    await this.workflowAuthorizationService.assertSameTeamAsProcessVersionOwner(
      id,
      currentUser,
    );
    this.ensureDraftLifecycle(version, 'Only Draft versions can be deleted');

    await this.dataSource.transaction(async (manager) => {
      await this.processVersionsRepository.delete(id, manager);
      await this.auditLogWriterService.create(
        {
          entityType: 'process_version',
          entityId: version.id,
          action: 'DELETE',
          actorId: currentUser.id,
          reasonForChange: 'Deleted process version via API',
          oldData: version,
        },
        manager,
      );
    });
  }

  async submitForReview(
    id: string,
    justificationDto: LifecycleJustificationDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionRecord> {
    this.assertRole(
      currentUser,
      Role.EDITOR,
      'Only editors can submit versions for review',
    );
    const version = await this.getByIdInternal(id);

    await this.workflowAuthorizationService.assertSameTeamAsProcessVersionOwner(
      id,
      currentUser,
    );
    this.ensureLifecycle(
      version,
      'Draft',
      'Only Draft versions can be submitted for review',
    );
    this.ensureMinimumMetadata(version);
    await this.ensureHasBpmnAsset(id);
    await this.ensureHasProcedure(id);

    return await this.transitionVersionState({
      version,
      currentUser,
      toState: 'In Review',
      action: 'STATE_CHANGE',
      reason:
        justificationDto.reason ??
        'Submitted process version for formal review',
    });
  }

  async approve(
    id: string,
    justificationDto: LifecycleJustificationDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionRecord> {
    this.assertRole(
      currentUser,
      Role.REVIEWER,
      'Only reviewers can approve versions',
    );
    const version = await this.getByIdInternal(id);

    this.ensureLifecycle(
      version,
      'In Review',
      'Only versions in review can be approved',
    );

    return await this.transitionVersionState({
      version,
      currentUser,
      toState: 'Approved',
      action: 'APPROVE',
      reason: justificationDto.reason ?? 'Approved process version',
    });
  }

  async reject(
    id: string,
    justificationDto: RequiredJustificationDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionRecord> {
    this.assertRole(
      currentUser,
      Role.REVIEWER,
      'Only reviewers can reject versions',
    );
    const version = await this.getByIdInternal(id);

    this.ensureLifecycle(
      version,
      'In Review',
      'Only versions in review can be rejected',
    );

    return await this.transitionVersionState({
      version,
      currentUser,
      toState: 'Draft',
      action: 'REJECT',
      reason: justificationDto.reason,
    });
  }

  async reopen(
    id: string,
    justificationDto: RequiredJustificationDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionRecord> {
    this.assertRole(
      currentUser,
      Role.REVIEWER,
      'Only reviewers can reopen versions',
    );
    const version = await this.getByIdInternal(id);

    this.ensureLifecycle(
      version,
      'Approved',
      'Only approved versions can be reopened to Draft',
    );

    return await this.transitionVersionState({
      version,
      currentUser,
      toState: 'Draft',
      action: 'STATE_CHANGE',
      reason: justificationDto.reason,
    });
  }

  async publish(
    id: string,
    justificationDto: LifecycleJustificationDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionRecord> {
    this.assertRole(
      currentUser,
      Role.PUBLISHER,
      'Only publishers can publish versions',
    );
    const version = await this.getByIdInternal(id);

    this.ensureLifecycle(
      version,
      'Approved',
      'Only approved versions can be published',
    );
    this.ensureMinimumMetadata(version);
    this.ensureChecklistComplete(version);
    await this.ensureHasBpmnAsset(id);
    await this.ensureHasProcedure(id);

    return await this.dataSource.transaction(async (manager) => {
      const lockedVersion = await this.getRequiredVersion(id, manager, true);
      const approverId =
        await this.processVersionsRepository.findLatestActorForState(
          id,
          'Approved',
          manager,
        );

      if (!approverId) {
        throw new ConflictException(
          'An approval record must exist before publication',
        );
      }

      if (approverId === currentUser.id) {
        throw new ConflictException(
          'The same actor must not approve and publish the same version',
        );
      }

      const existingPublishedVersion =
        await this.processVersionsRepository.findPublishedVersion(
          lockedVersion.processId,
          lockedVersion.architectureState,
          manager,
          lockedVersion.id,
          true,
        );

      if (existingPublishedVersion) {
        const archivedVersion =
          await this.processVersionsRepository.setLifecycleState(
            existingPublishedVersion.id,
            'Archived',
            currentUser.id,
            manager,
          );

        await this.processVersionsRepository.insertStateHistory(
          {
            processVersionId: archivedVersion.id,
            fromState: 'Published',
            toState: 'Archived',
            actorId: currentUser.id,
            reason:
              'Automatically archived during publication of a newer version',
          },
          manager,
        );

        await this.auditLogWriterService.create(
          {
            entityType: 'process_version',
            entityId: archivedVersion.id,
            action: 'ARCHIVE',
            actorId: currentUser.id,
            reasonForChange:
              'Automatically archived during publication of a newer version',
            oldData: existingPublishedVersion,
            newData: archivedVersion,
          },
          manager,
        );
      }

      const publishedVersion =
        await this.processVersionsRepository.setLifecycleState(
          lockedVersion.id,
          'Published',
          currentUser.id,
          manager,
        );

      await this.processVersionsRepository.insertStateHistory(
        {
          processVersionId: publishedVersion.id,
          fromState: 'Approved',
          toState: 'Published',
          actorId: currentUser.id,
          reason:
            justificationDto.reason ?? 'Published approved process version',
        },
        manager,
      );

      await this.auditLogWriterService.create(
        {
          entityType: 'process_version',
          entityId: publishedVersion.id,
          action: 'PUBLISH',
          actorId: currentUser.id,
          reasonForChange:
            justificationDto.reason ?? 'Published approved process version',
          oldData: lockedVersion,
          newData: publishedVersion,
        },
        manager,
      );

      return publishedVersion;
    });
  }

  async archive(
    id: string,
    justificationDto: RequiredJustificationDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionRecord> {
    this.assertRole(
      currentUser,
      Role.PUBLISHER,
      'Only publishers can archive versions',
    );
    const version = await this.getByIdInternal(id);

    this.ensureLifecycle(
      version,
      'Published',
      'Only published versions can be archived',
    );

    return await this.transitionVersionState({
      version,
      currentUser,
      toState: 'Archived',
      action: 'ARCHIVE',
      reason: justificationDto.reason,
    });
  }

  async promote(
    id: string,
    promoteProcessVersionDto: PromoteProcessVersionDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionRecord> {
    this.assertRole(
      currentUser,
      Role.PUBLISHER,
      'Only publishers can promote versions',
    );
    const sourceVersion = await this.getByIdInternal(id);

    this.ensureLifecycle(
      sourceVersion,
      'Published',
      'Only published TO-BE versions can be promoted',
    );

    if (sourceVersion.architectureState !== 'TO-BE') {
      throw new ConflictException(
        'Only published TO-BE versions can be promoted',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const lockedSource = await this.getRequiredVersion(id, manager, true);
      const existingPublishedAsIs =
        await this.processVersionsRepository.findPublishedVersion(
          lockedSource.processId,
          'AS-IS',
          manager,
          undefined,
          true,
        );

      if (existingPublishedAsIs) {
        const archivedAsIs =
          await this.processVersionsRepository.setLifecycleState(
            existingPublishedAsIs.id,
            'Archived',
            currentUser.id,
            manager,
          );

        await this.processVersionsRepository.insertStateHistory(
          {
            processVersionId: archivedAsIs.id,
            fromState: 'Published',
            toState: 'Archived',
            actorId: currentUser.id,
            reason: 'Archived previous AS-IS version during TO-BE promotion',
          },
          manager,
        );

        await this.auditLogWriterService.create(
          {
            entityType: 'process_version',
            entityId: archivedAsIs.id,
            action: 'ARCHIVE',
            actorId: currentUser.id,
            reasonForChange:
              'Archived previous AS-IS version during TO-BE promotion',
            oldData: existingPublishedAsIs,
            newData: archivedAsIs,
          },
          manager,
        );
      }

      const archivedSource =
        await this.processVersionsRepository.setLifecycleState(
          lockedSource.id,
          'Archived',
          currentUser.id,
          manager,
        );

      await this.processVersionsRepository.insertStateHistory(
        {
          processVersionId: archivedSource.id,
          fromState: 'Published',
          toState: 'Archived',
          actorId: currentUser.id,
          reason: 'Archived promoted TO-BE version after promotion',
        },
        manager,
      );

      await this.auditLogWriterService.create(
        {
          entityType: 'process_version',
          entityId: archivedSource.id,
          action: 'ARCHIVE',
          actorId: currentUser.id,
          reasonForChange: 'Archived promoted TO-BE version after promotion',
          oldData: lockedSource,
          newData: archivedSource,
        },
        manager,
      );

      const promotedVersion = await this.processVersionsRepository.create(
        {
          processId: lockedSource.processId,
          versionNumber:
            await this.processVersionsRepository.getNextVersionNumber(
              lockedSource.processId,
              manager,
            ),
          lifecycleState: 'Published',
          architectureState: 'AS-IS',
          title: promoteProcessVersionDto.title ?? lockedSource.title,
          checklistCompleted: true,
          derivedFromVersionId: lockedSource.id,
          changeDescription:
            'Promoted the published TO-BE version into a new AS-IS version.',
          reasonForChange: promoteProcessVersionDto.justification,
          createdBy: currentUser.id,
          updatedBy: currentUser.id,
        },
        manager,
      );

      await this.processVersionsRepository.insertStateHistory(
        {
          processVersionId: promotedVersion.id,
          fromState: null,
          toState: 'Published',
          actorId: currentUser.id,
          reason:
            'Created the new AS-IS version directly as Published during promotion',
        },
        manager,
      );

      await this.auditLogWriterService.create(
        {
          entityType: 'process_version',
          entityId: promotedVersion.id,
          action: 'PROMOTE',
          actorId: currentUser.id,
          reasonForChange: promoteProcessVersionDto.justification,
          newData: {
            ...promotedVersion,
            promotedFromVersionId: lockedSource.id,
          },
        },
        manager,
      );

      return promotedVersion;
    });
  }

  private async transitionVersionState(params: {
    version: ProcessVersionRecord;
    currentUser: AuthenticatedUser;
    toState: string;
    action: 'STATE_CHANGE' | 'APPROVE' | 'REJECT' | 'ARCHIVE';
    reason: string;
  }): Promise<ProcessVersionRecord> {
    return await this.dataSource.transaction(async (manager) => {
      const lockedVersion = await this.getRequiredVersion(
        params.version.id,
        manager,
        true,
      );
      const transitionedVersion =
        await this.processVersionsRepository.setLifecycleState(
          lockedVersion.id,
          params.toState,
          params.currentUser.id,
          manager,
        );

      await this.processVersionsRepository.insertStateHistory(
        {
          processVersionId: transitionedVersion.id,
          fromState: lockedVersion.lifecycleState,
          toState: params.toState,
          actorId: params.currentUser.id,
          reason: params.reason,
        },
        manager,
      );

      await this.auditLogWriterService.create(
        {
          entityType: 'process_version',
          entityId: transitionedVersion.id,
          action: params.action,
          actorId: params.currentUser.id,
          reasonForChange: params.reason,
          oldData: lockedVersion,
          newData: transitionedVersion,
        },
        manager,
      );

      return transitionedVersion;
    });
  }

  private ensureLifecycle(
    version: ProcessVersionRecord,
    expectedLifecycleState: string,
    message: string,
  ): void {
    if (version.lifecycleState !== expectedLifecycleState) {
      throw new ConflictException(message);
    }
  }

  private ensureDraftLifecycle(
    version: ProcessVersionRecord,
    message: string,
  ): void {
    this.ensureLifecycle(version, 'Draft', message);
  }

  private ensureChecklistComplete(version: ProcessVersionRecord): void {
    if (!version.checklistCompleted) {
      throw new ConflictException(
        'A version must have checklistCompleted = true before publication',
      );
    }
  }

  private ensureMinimumMetadata(version: ProcessVersionRecord): void {
    if (
      version.title.trim() === '' ||
      version.changeDescription.trim() === '' ||
      version.reasonForChange.trim() === ''
    ) {
      throw new ConflictException(
        'Minimum required version metadata is missing',
      );
    }
  }

  private async ensureHasBpmnAsset(id: string): Promise<void> {
    const bpmnAssetCount =
      await this.processVersionsRepository.countBpmnAssets(id);

    if (bpmnAssetCount === 0) {
      throw new ConflictException(
        'At least one BPMN asset must be attached before this transition',
      );
    }
  }

  private async ensureHasProcedure(id: string): Promise<void> {
    const rows = await this.dataSource.query<{ exists: boolean }[]>(
      `
        SELECT EXISTS (
          SELECT 1
          FROM procedures pr
          WHERE pr.process_version_id = $1
        ) AS exists
      `,
      [id],
    );

    if (!rows[0]?.exists) {
      throw new ConflictException(
        'At least one procedure must be defined before this transition',
      );
    }
  }

  private async ensureProcessExists(processId: string) {
    const process = await this.processesRepository.findById(processId);

    if (!process) {
      throw new NotFoundException('Process not found');
    }

    return process;
  }

  private async getRequiredVersion(
    id: string,
    executor: SqlExecutor,
    forUpdate = false,
  ): Promise<ProcessVersionRecord> {
    const version = await this.processVersionsRepository.findById(
      id,
      executor,
      forUpdate,
    );

    if (!version) {
      throw new NotFoundException('Process version not found');
    }

    return version;
  }

  private toCreateInput(
    processId: string,
    dto: CreateProcessVersionDto,
    actorId: string,
    versionNumber: number,
  ): CreateProcessVersionInput {
    return {
      processId,
      versionNumber,
      lifecycleState: 'Draft',
      architectureState: dto.architectureState,
      title: dto.title,
      checklistCompleted: false,
      derivedFromVersionId: dto.derivedFromVersionId ?? null,
      changeDescription: dto.changeDescription,
      reasonForChange: dto.reasonForChange,
      createdBy: actorId,
      updatedBy: actorId,
    };
  }

  private canManageDraftVersions(
    processTeamId: string,
    currentUser: AuthenticatedUser,
  ): boolean {
    return (
      currentUser.role === Role.EDITOR && currentUser.team?.id === processTeamId
    );
  }

  private assertRole(
    currentUser: AuthenticatedUser,
    expectedRole: Role,
    message: string,
  ): void {
    if (currentUser.role !== expectedRole) {
      throw new ForbiddenException(message);
    }
  }
}
