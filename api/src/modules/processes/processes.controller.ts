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
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { IdParamDto } from '../../common/dto/uuid-param.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SWAGGER_BEARER_AUTH_NAME } from '../../common/swagger/swagger.constants';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateProcessDto } from './dto/create-process.dto';
import { ProcessResponseDto } from './dto/process-response.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import type { ProcessRecord } from './processes.repository';
import { ProcessesService } from './processes.service';

@ApiTags('processes')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: 'JWT bearer token is missing or invalid.',
})
@ApiForbiddenResponse({
  description:
    'The authenticated user does not have permission to access this endpoint.',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('processes')
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @ApiOperation({ summary: 'Create a process' })
  @ApiBody({ type: CreateProcessDto })
  @ApiCreatedResponse({
    description: 'Process created successfully.',
    type: ProcessResponseDto,
  })
  @Roles(Role.EDITOR)
  @Post()
  async create(
    @Body() createProcessDto: CreateProcessDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessResponseDto> {
    return this.toDto(
      await this.processesService.create(createProcessDto, currentUser),
    );
  }

  @ApiOperation({ summary: 'List processes' })
  @ApiOkResponse({
    description: 'Processes accessible to the authenticated user.',
    type: ProcessResponseDto,
    isArray: true,
  })
  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get()
  async list(): Promise<ProcessResponseDto[]> {
    const processes = await this.processesService.list();

    return processes.map((process) => this.toDto(process));
  }

  @ApiOperation({ summary: 'Get a process by id' })
  @ApiParam({
    name: 'id',
    description: 'Process UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Requested process record.',
    type: ProcessResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Process not found.' })
  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get(':id')
  async getById(@Param() params: IdParamDto): Promise<ProcessResponseDto> {
    return this.toDto(await this.processesService.getById(params.id));
  }

  @ApiOperation({ summary: 'Update a process' })
  @ApiParam({
    name: 'id',
    description: 'Process UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateProcessDto })
  @ApiOkResponse({
    description: 'Process updated successfully.',
    type: ProcessResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Process not found.' })
  @Roles(Role.EDITOR)
  @Patch(':id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateProcessDto: UpdateProcessDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcessResponseDto> {
    return this.toDto(
      await this.processesService.update(
        params.id,
        updateProcessDto,
        currentUser,
      ),
    );
  }

  @ApiOperation({
    summary: 'Delete a process',
    description:
      'Deletes a process only when it has no process versions. This operation is audited and returns 409 if versions still exist.',
  })
  @ApiParam({
    name: 'id',
    description: 'Process UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Process deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Process not found.' })
  @ApiConflictResponse({
    description:
      'Process cannot be deleted while it still has versions or other business rules prevent the deletion.',
  })
  @Roles(Role.EDITOR)
  @Delete(':id')
  async delete(
    @Param() params: IdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.processesService.delete(params.id, currentUser);
  }

  private toDto(process: ProcessRecord): ProcessResponseDto {
    return plainToInstance(ProcessResponseDto, process);
  }
}
