import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProcessVersionIdParamDto } from '../../common/dto/uuid-param.dto';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SWAGGER_BEARER_AUTH_NAME } from '../../common/swagger/swagger.constants';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AuditReaderService } from './audit-reader.service';
import { AuditEntityParamDto } from './dto/audit-entity-param.dto';
import { AuditLogResponseDto } from './dto/audit-log-response.dto';
import { VersionStateHistoryResponseDto } from './dto/version-state-history-response.dto';
import type {
  AuditLogRecord,
  VersionStateHistoryRecord,
} from './audit-reader.repository';

@ApiTags('audit')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: 'JWT bearer token is missing or invalid.',
})
@ApiForbiddenResponse({
  description:
    'The authenticated user does not have permission to access this endpoint.',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AuditController {
  constructor(private readonly auditReaderService: AuditReaderService) {}

  @ApiOperation({
    summary: 'List lifecycle state history for a process version',
  })
  @ApiParam({
    name: 'processVersionId',
    description: 'Process version UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description:
      'Lifecycle state transitions recorded for the process version.',
    type: VersionStateHistoryResponseDto,
    isArray: true,
  })
  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER)
  @Get('process-versions/:processVersionId/state-history')
  async listVersionStateHistory(
    @Param() params: ProcessVersionIdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<VersionStateHistoryResponseDto[]> {
    const history = await this.auditReaderService.listVersionStateHistory(
      params.processVersionId,
      currentUser,
    );

    return history.map((entry) => this.toVersionStateHistoryDto(entry));
  }

  @ApiOperation({ summary: 'List audit logs for an entity' })
  @ApiParam({
    name: 'entityType',
    description: 'Audited entity type.',
    enum: [
      'area',
      'process',
      'process_version',
      'procedure',
      'asset',
      'user',
      'role',
      'team',
    ],
  })
  @ApiParam({
    name: 'entityId',
    description: 'Audited entity UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Audit log entries for the requested entity.',
    type: AuditLogResponseDto,
    isArray: true,
  })
  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.SYSTEM_ADMIN)
  @Get('audit-logs/:entityType/:entityId')
  async listAuditLogsByEntity(
    @Param() params: AuditEntityParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<AuditLogResponseDto[]> {
    const logs = await this.auditReaderService.listLogsByEntity(
      params.entityType,
      params.entityId,
      currentUser,
    );

    return logs.map((log) => this.toAuditLogDto(log));
  }

  private toVersionStateHistoryDto(
    entry: VersionStateHistoryRecord,
  ): VersionStateHistoryResponseDto {
    return plainToInstance(VersionStateHistoryResponseDto, entry);
  }

  private toAuditLogDto(log: AuditLogRecord): AuditLogResponseDto {
    return plainToInstance(AuditLogResponseDto, log);
  }
}
