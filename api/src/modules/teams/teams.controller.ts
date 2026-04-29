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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { IdParamDto } from '../../common/dto/uuid-param.dto';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SWAGGER_BEARER_AUTH_NAME } from '../../common/swagger/swagger.constants';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import type { TeamRecord } from './teams.repository';
import { TeamsService } from './teams.service';

@ApiTags('teams')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: 'JWT bearer token is missing or invalid.',
})
@ApiForbiddenResponse({
  description:
    'The authenticated user does not have permission to access this endpoint.',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @ApiOperation({ summary: 'List teams' })
  @ApiOkResponse({
    description: 'Teams available in the tenant.',
    type: TeamResponseDto,
    isArray: true,
  })
  @Roles(Role.SYSTEM_ADMIN)
  @Get()
  async list(): Promise<TeamResponseDto[]> {
    const teams = await this.teamsService.list();

    return teams.map((team) => plainToInstance(TeamResponseDto, team));
  }

  @ApiOperation({ summary: 'Get a team by id' })
  @ApiParam({
    name: 'id',
    description: 'Team UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Requested team record.',
    type: TeamResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Team not found.' })
  @Roles(Role.SYSTEM_ADMIN)
  @Get(':id')
  async getById(@Param() params: IdParamDto): Promise<TeamResponseDto> {
    return this.toDto(await this.teamsService.getById(params.id));
  }

  @ApiOperation({ summary: 'Create a team' })
  @ApiBody({ type: CreateTeamDto })
  @ApiCreatedResponse({
    description: 'Team created successfully.',
    type: TeamResponseDto,
  })
  @ApiConflictResponse({
    description: 'Team code or name already exists.',
  })
  @Roles(Role.SYSTEM_ADMIN)
  @Post()
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TeamResponseDto> {
    return this.toDto(
      await this.teamsService.create(createTeamDto, currentUser),
    );
  }

  @ApiOperation({ summary: 'Update a team' })
  @ApiParam({
    name: 'id',
    description: 'Team UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateTeamDto })
  @ApiOkResponse({
    description: 'Team updated successfully.',
    type: TeamResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Team not found.' })
  @ApiConflictResponse({
    description: 'Team code or name already exists.',
  })
  @Roles(Role.SYSTEM_ADMIN)
  @Patch(':id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateTeamDto: UpdateTeamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TeamResponseDto> {
    return this.toDto(
      await this.teamsService.update(params.id, updateTeamDto, currentUser),
    );
  }

  @ApiOperation({ summary: 'Deactivate a team' })
  @ApiParam({
    name: 'id',
    description: 'Team UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Team deactivated successfully.',
    type: TeamResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Team not found.' })
  @Roles(Role.SYSTEM_ADMIN)
  @Patch(':id/deactivate')
  async deactivate(
    @Param() params: IdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TeamResponseDto> {
    return this.toDto(
      await this.teamsService.deactivate(params.id, currentUser),
    );
  }

  private toDto(team: TeamRecord): TeamResponseDto {
    return plainToInstance(TeamResponseDto, team);
  }
}
