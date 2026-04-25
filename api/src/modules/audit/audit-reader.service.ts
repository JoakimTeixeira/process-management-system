import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Role } from '../../common/enums/role.enum';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

import type {
  AuditLogRecord,
  VersionStateHistoryRecord,
} from './audit-reader.repository';
import { AuditReaderRepository } from './audit-reader.repository';

@Injectable()
export class AuditReaderService {
  private static readonly WORKFLOW_ENTITY_TYPES = [
    'area',
    'process',
    'process_version',
    'procedure',
    'asset',
  ] as const;

  private static readonly SYSTEM_ADMIN_ENTITY_TYPES = [
    'user',
    'role',
    'team',
  ] as const;

  constructor(private readonly auditReaderRepository: AuditReaderRepository) {}

  async listLogsByEntity(
    entityType: string,
    entityId: string,
    currentUser: AuthenticatedUser,
  ): Promise<AuditLogRecord[]> {
    if (
      AuditReaderService.SYSTEM_ADMIN_ENTITY_TYPES.includes(
        entityType as (typeof AuditReaderService.SYSTEM_ADMIN_ENTITY_TYPES)[number],
      )
    ) {
      if (currentUser.role !== Role.SYSTEM_ADMIN) {
        throw new ForbiddenException(
          'Only SYSTEM_ADMIN may consult technical audit records',
        );
      }

      return await this.auditReaderRepository.findLogsByEntity(
        entityType,
        entityId,
      );
    }

    await this.assertWorkflowAuditAccess(
      entityType as (typeof AuditReaderService.WORKFLOW_ENTITY_TYPES)[number],
      entityId,
      currentUser,
    );

    return await this.auditReaderRepository.findLogsByEntity(
      entityType,
      entityId,
    );
  }

  async listVersionStateHistory(
    processVersionId: string,
    currentUser: AuthenticatedUser,
  ): Promise<VersionStateHistoryRecord[]> {
    await this.assertWorkflowAuditAccess(
      'process_version',
      processVersionId,
      currentUser,
    );

    return await this.auditReaderRepository.findVersionStateHistory(
      processVersionId,
    );
  }

  private async assertWorkflowAuditAccess(
    entityType: (typeof AuditReaderService.WORKFLOW_ENTITY_TYPES)[number],
    entityId: string,
    currentUser: AuthenticatedUser,
  ): Promise<void> {
    if (currentUser.role === Role.SYSTEM_ADMIN) {
      throw new ForbiddenException(
        'SYSTEM_ADMIN may only consult technical and user-administration audit records',
      );
    }

    const access = await this.auditReaderRepository.findWorkflowAuditAccess(
      entityType,
      entityId,
    );

    if (!access.entityExists) {
      throw new NotFoundException('Audit entity not found');
    }

    if (!currentUser.team?.id || !access.ownerTeamId) {
      throw new ForbiddenException(
        'You are not allowed to consult audit logs for this entity',
      );
    }

    if (currentUser.team.id !== access.ownerTeamId) {
      throw new ForbiddenException(
        'You are not allowed to consult audit logs for this entity',
      );
    }
  }
}
