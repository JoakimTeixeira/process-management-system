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

import {
  IdParamDto,
  ProcessVersionIdParamDto,
} from '../../common/dto/uuid-param.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SWAGGER_BEARER_AUTH_NAME } from '../../common/swagger/swagger.constants';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { ProcedureResponseDto } from './dto/procedure-response.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import type { ProcedureRecord } from './procedures.repository';
import { ProceduresService } from './procedures.service';

@ApiTags('procedures')
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
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @ApiOperation({ summary: 'Create a procedure for a process version' })
  @ApiParam({
    name: 'processVersionId',
    description: 'Parent process version UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: CreateProcedureDto })
  @ApiCreatedResponse({
    description: 'Procedure created successfully.',
    type: ProcedureResponseDto,
  })
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

  @ApiOperation({
    summary: 'List procedures across accessible process versions',
  })
  @ApiOkResponse({
    description: 'Procedures accessible to the authenticated user.',
    type: ProcedureResponseDto,
    isArray: true,
  })
  @Roles(Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER)
  @Get('procedures')
  async listAll(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ProcedureResponseDto[]> {
    const procedures = await this.proceduresService.listAll(currentUser);

    return procedures.map((procedure) => this.toDto(procedure));
  }

  @ApiOperation({ summary: 'List procedures for a process version' })
  @ApiParam({
    name: 'processVersionId',
    description: 'Parent process version UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Procedures attached to the requested process version.',
    type: ProcedureResponseDto,
    isArray: true,
  })
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

  @ApiOperation({ summary: 'Get a procedure by id' })
  @ApiParam({
    name: 'id',
    description: 'Procedure UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Requested procedure record.',
    type: ProcedureResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Procedure not found.' })
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

  @ApiOperation({ summary: 'Update a procedure' })
  @ApiParam({
    name: 'id',
    description: 'Procedure UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateProcedureDto })
  @ApiOkResponse({
    description: 'Procedure updated successfully.',
    type: ProcedureResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Procedure not found.' })
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

  private toDto(procedure: ProcedureRecord): ProcedureResponseDto {
    return plainToInstance(ProcedureResponseDto, procedure);
  }
}
