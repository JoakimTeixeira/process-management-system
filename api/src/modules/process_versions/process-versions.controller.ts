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

import { IdParamDto, ProcessIdParamDto } from '../../common/dto/uuid-param.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateProcessVersionDto } from './dto/create-process-version.dto';
import { LifecycleJustificationDto } from './dto/lifecycle-justification.dto';
import { ProcessVersionResponseDto } from './dto/process-version-response.dto';
import { PromoteProcessVersionDto } from './dto/promote-process-version.dto';
import { RequiredJustificationDto } from './dto/required-justification.dto';
import { UpdateProcessVersionDto } from './dto/update-process-version.dto';
import type { ProcessVersionRecord } from './process-versions.repository';
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
    return this.toDto(
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

    return versions.map((version) => this.toDto(version));
  }

  @Get('process-versions/:id')
  async getById(
    @Param() params: IdParamDto,
  ): Promise<ProcessVersionResponseDto> {
    return this.toDto(await this.processVersionsService.getById(params.id));
  }

  @Roles(Role.EDITOR)
  @Patch('process-versions/:id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateProcessVersionDto: UpdateProcessVersionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionResponseDto> {
    return this.toDto(
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

  @Roles(Role.EDITOR)
  @Post('process-versions/:id/submit-for-review')
  async submitForReview(
    @Param() params: IdParamDto,
    @Body() justificationDto: LifecycleJustificationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionResponseDto> {
    return this.toDto(
      await this.processVersionsService.submitForReview(
        params.id,
        justificationDto,
        currentUser,
      ),
    );
  }

  @Roles(Role.REVIEWER)
  @Post('process-versions/:id/approve')
  async approve(
    @Param() params: IdParamDto,
    @Body() justificationDto: LifecycleJustificationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionResponseDto> {
    return this.toDto(
      await this.processVersionsService.approve(
        params.id,
        justificationDto,
        currentUser,
      ),
    );
  }

  @Roles(Role.REVIEWER)
  @Post('process-versions/:id/reject')
  async reject(
    @Param() params: IdParamDto,
    @Body() justificationDto: RequiredJustificationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionResponseDto> {
    return this.toDto(
      await this.processVersionsService.reject(
        params.id,
        justificationDto,
        currentUser,
      ),
    );
  }

  @Roles(Role.REVIEWER)
  @Post('process-versions/:id/reopen')
  async reopen(
    @Param() params: IdParamDto,
    @Body() justificationDto: RequiredJustificationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionResponseDto> {
    return this.toDto(
      await this.processVersionsService.reopen(
        params.id,
        justificationDto,
        currentUser,
      ),
    );
  }

  @Roles(Role.PUBLISHER)
  @Post('process-versions/:id/publish')
  async publish(
    @Param() params: IdParamDto,
    @Body() justificationDto: LifecycleJustificationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionResponseDto> {
    return this.toDto(
      await this.processVersionsService.publish(
        params.id,
        justificationDto,
        currentUser,
      ),
    );
  }

  @Roles(Role.PUBLISHER)
  @Post('process-versions/:id/archive')
  async archive(
    @Param() params: IdParamDto,
    @Body() justificationDto: RequiredJustificationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionResponseDto> {
    return this.toDto(
      await this.processVersionsService.archive(
        params.id,
        justificationDto,
        currentUser,
      ),
    );
  }

  @Roles(Role.PUBLISHER)
  @Post('process-versions/:id/promote')
  async promote(
    @Param() params: IdParamDto,
    @Body() promoteProcessVersionDto: PromoteProcessVersionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionResponseDto> {
    return this.toDto(
      await this.processVersionsService.promote(
        params.id,
        promoteProcessVersionDto,
        currentUser,
      ),
    );
  }

  private toDto(version: ProcessVersionRecord): ProcessVersionResponseDto {
    return plainToInstance(ProcessVersionResponseDto, version);
  }
}
