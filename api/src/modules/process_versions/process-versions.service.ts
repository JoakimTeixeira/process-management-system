import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { isUniqueViolationError } from '../../common/utils/postgres-error.util';
import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ProcessesRepository } from '../processes/processes.repository';
import { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
import type { CreateProcessVersionDto } from './dto/create-process-version.dto';
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
    await this.ensureProcessExists(processId);
    await this.workflowAuthorizationService.assertSameTeamAsProcessOwner(
      processId,
      currentUser,
    );
    await this.ensureVersionNumberAvailable(
      processId,
      createProcessVersionDto.versionNumber,
    );

    const derivedFromVersion = createProcessVersionDto.derivedFromVersionId
      ? await this.getById(createProcessVersionDto.derivedFromVersionId)
      : null;

    if (derivedFromVersion && derivedFromVersion.processId !== processId) {
      throw new ConflictException(
        'derivedFromVersionId must reference a version of the same process',
      );
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const createdVersion = await this.processVersionsRepository.create(
          this.toCreateInput(
            processId,
            createProcessVersionDto,
            currentUser.id,
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

  async listByProcessId(processId: string): Promise<ProcessVersionRecord[]> {
    await this.ensureProcessExists(processId);

    return await this.processVersionsRepository.findByProcessId(processId);
  }

  async getById(id: string): Promise<ProcessVersionRecord> {
    const version = await this.processVersionsRepository.findById(id);

    if (!version) {
      throw new NotFoundException('Process version not found');
    }

    return version;
  }

  async update(
    id: string,
    updateProcessVersionDto: UpdateProcessVersionDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionRecord> {
    const currentVersion = await this.getById(id);

    await this.workflowAuthorizationService.assertSameTeamAsProcessVersionOwner(
      id,
      currentUser,
    );
    this.ensureDraftLifecycle(
      currentVersion,
      'Only Draft versions can be updated',
    );

    if (updateProcessVersionDto.derivedFromVersionId) {
      const derivedFromVersion = await this.getById(
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
    const version = await this.getById(id);

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

  private async ensureProcessExists(processId: string): Promise<void> {
    const processExists = await this.processesRepository.findById(processId);

    if (!processExists) {
      throw new NotFoundException('Process not found');
    }
  }

  private async ensureVersionNumberAvailable(
    processId: string,
    versionNumber: number,
  ): Promise<void> {
    const existingVersion =
      await this.processVersionsRepository.findByProcessAndVersionNumber(
        processId,
        versionNumber,
      );

    if (existingVersion) {
      throw new ConflictException(
        ProcessVersionsService.DUPLICATE_VERSION_MESSAGE,
      );
    }
  }

  private toCreateInput(
    processId: string,
    dto: CreateProcessVersionDto,
    actorId: string,
  ): CreateProcessVersionInput {
    return {
      processId,
      versionNumber: dto.versionNumber,
      lifecycleState: 'Draft',
      architectureState: dto.architectureState,
      title: dto.title,
      checklistCompleted: dto.checklistCompleted ?? false,
      derivedFromVersionId: dto.derivedFromVersionId ?? null,
      changeDescription: dto.changeDescription,
      reasonForChange: dto.reasonForChange,
      createdBy: actorId,
      updatedBy: actorId,
    };
  }
}
