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

import { IdParamDto, ProcessIdParamDto } from '../../common/dto/uuid-param.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateProcessVersionDto } from './dto/create-process-version.dto';
import { ProcessVersionResponseDto } from './dto/process-version-response.dto';
import { UpdateProcessVersionDto } from './dto/update-process-version.dto';
import { ProcessVersionsService } from './process-versions.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ProcessVersionsController {
  constructor(
    private readonly processVersionsService: ProcessVersionsService,
  ) {}

  @Roles(Role.EDITOR)
  @Post('processes/:processId/versions')
  async create(
    @Param() params: ProcessIdParamDto,
    @Body() createProcessVersionDto: CreateProcessVersionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionResponseDto> {
    return new ProcessVersionResponseDto(
      await this.processVersionsService.create(
        params.processId,
        createProcessVersionDto,
        currentUser,
      ),
    );
  }

  @Get('processes/:processId/versions')
  async listByProcessId(
    @Param() params: ProcessIdParamDto,
  ): Promise<ProcessVersionResponseDto[]> {
    const versions = await this.processVersionsService.listByProcessId(
      params.processId,
    );

    return versions.map((version) => new ProcessVersionResponseDto(version));
  }

  @Get('process-versions/:id')
  async getById(
    @Param() params: IdParamDto,
  ): Promise<ProcessVersionResponseDto> {
    return new ProcessVersionResponseDto(
      await this.processVersionsService.getById(params.id),
    );
  }

  @Roles(Role.EDITOR)
  @Patch('process-versions/:id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateProcessVersionDto: UpdateProcessVersionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionResponseDto> {
    return new ProcessVersionResponseDto(
      await this.processVersionsService.update(
        params.id,
        updateProcessVersionDto,
        currentUser,
      ),
    );
  }

  @Roles(Role.EDITOR)
  @Delete('process-versions/:id')
  async delete(
    @Param() params: IdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.processVersionsService.delete(params.id, currentUser);
  }
}
