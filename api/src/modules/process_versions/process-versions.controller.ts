import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { IdParamDto, ProcessIdParamDto } from '../../common/dto/uuid-param.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SWAGGER_BEARER_AUTH_NAME } from '../../common/swagger/swagger.constants';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateProcessVersionDto } from './dto/create-process-version.dto';
import { LifecycleJustificationDto } from './dto/lifecycle-justification.dto';
import { ProcessVersionResponseDto } from './dto/process-version-response.dto';
import { PromoteProcessVersionDto } from './dto/promote-process-version.dto';
import { RequiredJustificationDto } from './dto/required-justification.dto';
import { UpdateProcessVersionDto } from './dto/update-process-version.dto';
import type { ProcessVersionRecord } from './process-versions.repository';
import { ProcessVersionsService } from './process-versions.service';

@ApiTags('versions')
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
export class ProcessVersionsController {
  constructor(
    private readonly processVersionsService: ProcessVersionsService,
  ) {}

  @ApiOperation({ summary: 'Create a process version' })
  @ApiParam({
    name: 'processId',
    description: 'Parent process UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: CreateProcessVersionDto })
  @ApiCreatedResponse({
    description: 'Process version created successfully.',
    type: ProcessVersionResponseDto,
  })
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

  @ApiOperation({ summary: 'List versions for a process' })
  @ApiParam({
    name: 'processId',
    description: 'Parent process UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Process versions accessible to the authenticated user.',
    type: ProcessVersionResponseDto,
    isArray: true,
  })
  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get('processes/:processId/versions')
  async listByProcessId(
    @Param() params: ProcessIdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionResponseDto[]> {
    const versions = await this.processVersionsService.listByProcessId(
      params.processId,
      currentUser,
    );

    return versions.map((version) => this.toDto(version));
  }

  @ApiOperation({ summary: 'Get a process version by id' })
  @ApiParam({
    name: 'id',
    description: 'Process version UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Requested process version record.',
    type: ProcessVersionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Process version not found.' })
  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get('process-versions/:id')
  async getById(
    @Param() params: IdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessVersionResponseDto> {
    return this.toDto(
      await this.processVersionsService.getById(params.id, currentUser),
    );
  }

  @ApiOperation({ summary: 'Update a process version' })
  @ApiParam({
    name: 'id',
    description: 'Process version UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateProcessVersionDto })
  @ApiOkResponse({
    description: 'Process version updated successfully.',
    type: ProcessVersionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Process version not found.' })
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

  @ApiOperation({ summary: 'Submit a process version for review' })
  @ApiParam({
    name: 'id',
    description: 'Process version UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: LifecycleJustificationDto })
  @ApiCreatedResponse({
    description: 'Process version submitted for review.',
    type: ProcessVersionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Process version not found.' })
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

  @ApiOperation({ summary: 'Approve a process version' })
  @ApiParam({
    name: 'id',
    description: 'Process version UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: LifecycleJustificationDto })
  @ApiCreatedResponse({
    description: 'Process version approved successfully.',
    type: ProcessVersionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Process version not found.' })
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

  @ApiOperation({ summary: 'Reject a process version' })
  @ApiParam({
    name: 'id',
    description: 'Process version UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: RequiredJustificationDto })
  @ApiCreatedResponse({
    description: 'Process version rejected successfully.',
    type: ProcessVersionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Process version not found.' })
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

  @ApiOperation({ summary: 'Reopen a rejected process version' })
  @ApiParam({
    name: 'id',
    description: 'Process version UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: RequiredJustificationDto })
  @ApiCreatedResponse({
    description: 'Process version reopened successfully.',
    type: ProcessVersionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Process version not found.' })
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

  @ApiOperation({ summary: 'Publish a process version' })
  @ApiParam({
    name: 'id',
    description: 'Process version UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: LifecycleJustificationDto })
  @ApiCreatedResponse({
    description: 'Process version published successfully.',
    type: ProcessVersionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Process version not found.' })
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

  @ApiOperation({ summary: 'Archive a process version' })
  @ApiParam({
    name: 'id',
    description: 'Process version UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: RequiredJustificationDto })
  @ApiCreatedResponse({
    description: 'Process version archived successfully.',
    type: ProcessVersionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Process version not found.' })
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

  @ApiOperation({ summary: 'Promote a process version' })
  @ApiParam({
    name: 'id',
    description: 'Process version UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: PromoteProcessVersionDto })
  @ApiCreatedResponse({
    description: 'Process version promoted successfully.',
    type: ProcessVersionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Process version not found.' })
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
