import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { isUniqueViolationError } from '../../common/utils/postgres-error.util';
import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ProcessVersionsRepository } from '../process_versions/process-versions.repository';
import { WorkflowAuthorizationService } from '../workflow_support/workflow-authorization.service';
import type { CreateProcedureDto } from './dto/create-procedure.dto';
import type { UpdateProcedureDto } from './dto/update-procedure.dto';
import type { ProcedureActivityDto } from './dto/shared-procedure.dto';
import type { ProcedureRecord } from './procedures.repository';
import { ProceduresRepository } from './procedures.repository';

@Injectable()
export class ProceduresService {
  private static readonly DUPLICATE_CODE_MESSAGE =
    'A Procedure with the same code already exists for this version';

  constructor(
    private readonly proceduresRepository: ProceduresRepository,
    private readonly processVersionsRepository: ProcessVersionsRepository,
    private readonly workflowAuthorizationService: WorkflowAuthorizationService,
    private readonly auditLogWriterService: AuditLogWriterService,
  ) {}

  async create(
    processVersionId: string,
    createProcedureDto: CreateProcedureDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcedureRecord> {
    const processVersion = await this.getRequiredVersion(processVersionId);

    await this.workflowAuthorizationService.assertSameTeamAsProcessVersionOwner(
      processVersionId,
      currentUser,
    );
    this.ensureDraftLifecycle(processVersion.lifecycleState);

    const existingProcedure =
      await this.proceduresRepository.findByVersionAndCode(
        processVersionId,
        createProcedureDto.code,
      );

    if (existingProcedure) {
      throw new ConflictException(ProceduresService.DUPLICATE_CODE_MESSAGE);
    }

    try {
      const procedure = await this.proceduresRepository.create({
        processVersionId,
        code: createProcedureDto.code,
        title: createProcedureDto.title,
        utility: createProcedureDto.utility,
        warranty: createProcedureDto.warranty,
        outcome: createProcedureDto.outcome,
        policy: createProcedureDto.policy,
        activities: this.mapActivities(createProcedureDto.activities),
        inputs: createProcedureDto.inputs,
        outputs: createProcedureDto.outputs,
        actorId: currentUser.id,
      });

      await this.auditLogWriterService.create({
        entityType: 'procedure',
        entityId: procedure.id,
        action: 'CREATE',
        actorId: currentUser.id,
        reasonForChange: 'Created procedure via API',
        newData: procedure,
      });

      return procedure;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(ProceduresService.DUPLICATE_CODE_MESSAGE);
      }

      throw error;
    }
  }

  async listByProcessVersionId(
    processVersionId: string,
  ): Promise<ProcedureRecord[]> {
    await this.getRequiredVersion(processVersionId);

    return await this.proceduresRepository.findByProcessVersionId(
      processVersionId,
    );
  }

  async getById(id: string): Promise<ProcedureRecord> {
    const procedure = await this.proceduresRepository.findById(id);

    if (!procedure) {
      throw new NotFoundException('Procedure not found');
    }

    return procedure;
  }

  async update(
    id: string,
    updateProcedureDto: UpdateProcedureDto,
    currentUser: AuthenticatedUser,
  ): Promise<ProcedureRecord> {
    const currentProcedure = await this.getById(id);
    const processVersion = await this.getRequiredVersion(
      currentProcedure.processVersionId,
    );

    await this.workflowAuthorizationService.assertSameTeamAsProcedureOwner(
      id,
      currentUser,
    );
    this.ensureDraftLifecycle(processVersion.lifecycleState);

    if (
      updateProcedureDto.code &&
      updateProcedureDto.code !== currentProcedure.code
    ) {
      const procedureWithSameCode =
        await this.proceduresRepository.findByVersionAndCode(
          currentProcedure.processVersionId,
          updateProcedureDto.code,
        );

      if (procedureWithSameCode) {
        throw new ConflictException(ProceduresService.DUPLICATE_CODE_MESSAGE);
      }
    }

    if (Object.keys(updateProcedureDto).length === 0) {
      return currentProcedure;
    }

    try {
      const updatedProcedure = await this.proceduresRepository.update(
        id,
        {
          code: updateProcedureDto.code,
          title: updateProcedureDto.title,
          utility: updateProcedureDto.utility,
          warranty: updateProcedureDto.warranty,
          outcome: updateProcedureDto.outcome,
          policy: updateProcedureDto.policy,
          activities: updateProcedureDto.activities
            ? this.mapActivities(updateProcedureDto.activities)
            : undefined,
          inputs: updateProcedureDto.inputs,
          outputs: updateProcedureDto.outputs,
        },
        currentUser.id,
      );

      await this.auditLogWriterService.create({
        entityType: 'procedure',
        entityId: updatedProcedure.id,
        action: 'UPDATE',
        actorId: currentUser.id,
        reasonForChange: 'Updated procedure via API',
        oldData: currentProcedure,
        newData: updatedProcedure,
      });

      return updatedProcedure;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(ProceduresService.DUPLICATE_CODE_MESSAGE);
      }

      throw error;
    }
  }

  async delete(id: string, currentUser: AuthenticatedUser): Promise<void> {
    const procedure = await this.getById(id);
    const processVersion = await this.getRequiredVersion(
      procedure.processVersionId,
    );

    await this.workflowAuthorizationService.assertSameTeamAsProcedureOwner(
      id,
      currentUser,
    );
    this.ensureDraftLifecycle(processVersion.lifecycleState);

    await this.proceduresRepository.delete(id);
    await this.auditLogWriterService.create({
      entityType: 'procedure',
      entityId: procedure.id,
      action: 'DELETE',
      actorId: currentUser.id,
      reasonForChange: 'Deleted procedure via API',
      oldData: procedure,
    });
  }

  private async getRequiredVersion(processVersionId: string) {
    const processVersion =
      await this.processVersionsRepository.findById(processVersionId);

    if (!processVersion) {
      throw new NotFoundException('Process version not found');
    }

    return processVersion;
  }

  private ensureDraftLifecycle(lifecycleState: string): void {
    if (lifecycleState !== 'Draft') {
      throw new ConflictException(
        'Procedures can only be modified for Draft versions',
      );
    }
  }

  private mapActivities(
    activities: ProcedureActivityDto[],
  ): Record<string, unknown>[] {
    return activities.map((activity) => ({
      resource: activity.resource,
      service_action: activity.serviceAction,
      work_instruction: activity.workInstruction,
    }));
  }
}
