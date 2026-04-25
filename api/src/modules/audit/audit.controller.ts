import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProcessVersionIdParamDto } from '../../common/dto/uuid-param.dto';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AuditReaderService } from './audit-reader.service';
import { AuditEntityParamDto } from './dto/audit-entity-param.dto';
import { AuditLogResponseDto } from './dto/audit-log-response.dto';
import { VersionStateHistoryResponseDto } from './dto/version-state-history-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AuditController {
  constructor(private readonly auditReaderService: AuditReaderService) {}

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

    return history.map((entry) => new VersionStateHistoryResponseDto(entry));
  }

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

    return logs.map((log) => new AuditLogResponseDto(log));
  }
}
