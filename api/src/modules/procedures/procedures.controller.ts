import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import {
  IdParamDto,
  ProcessVersionIdParamDto,
} from '../../common/dto/uuid-param.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { ProcedureResponseDto } from './dto/procedure-response.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import type { ProcedureRecord } from './procedures.repository';
import { ProceduresService } from './procedures.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Roles(Role.EDITOR)
  @Post('process-versions/:processVersionId/procedures')
  async create(
    @Param() params: ProcessVersionIdParamDto,
    @Body() createProcedureDto: CreateProcedureDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcedureResponseDto> {
    return this.toDto(
      await this.proceduresService.create(
        params.processVersionId,
        createProcedureDto,
        currentUser,
      ),
    );
  }

  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get('procedures')
  async listAll(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcedureResponseDto[]> {
    const procedures = await this.proceduresService.listAll(currentUser);

    return procedures.map((procedure) => this.toDto(procedure));
  }

  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get('process-versions/:processVersionId/procedures')
  async listByProcessVersionId(
    @Param() params: ProcessVersionIdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcedureResponseDto[]> {
    const procedures = await this.proceduresService.listByProcessVersionId(
      params.processVersionId,
      currentUser,
    );

    return procedures.map((procedure) => this.toDto(procedure));
  }

  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get('procedures/:id')
  async getById(
    @Param() params: IdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcedureResponseDto> {
    return this.toDto(
      await this.proceduresService.getById(params.id, currentUser),
    );
  }

  @Roles(Role.EDITOR)
  @Patch('procedures/:id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateProcedureDto: UpdateProcedureDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcedureResponseDto> {
    return this.toDto(
      await this.proceduresService.update(
        params.id,
        updateProcedureDto,
        currentUser,
      ),
    );
  }

  @Roles(Role.EDITOR)
  @Delete('procedures/:id')
  async delete(
    @Param() params: IdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.proceduresService.delete(params.id, currentUser);
  }

  private toDto(procedure: ProcedureRecord): ProcedureResponseDto {
    return plainToInstance(ProcedureResponseDto, procedure);
  }
}
