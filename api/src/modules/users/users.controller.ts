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

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { IdParamDto } from '../../common/dto/uuid-param.dto';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SWAGGER_BEARER_AUTH_NAME } from '../../common/swagger/swagger.constants';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { OwnerOptionResponseDto } from './dto/owner-option-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TeamOptionResponseDto } from './dto/team-option-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import type { UserAdminRecord } from './users.repository';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
@ApiUnauthorizedResponse({
  description: 'JWT bearer token is missing or invalid.',
})
@ApiForbiddenResponse({
  description:
    'The authenticated user does not have permission to access this endpoint.',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'List available process owners for the current user',
  })
  @ApiOkResponse({
    description: 'Owner options available to the authenticated user.',
    type: OwnerOptionResponseDto,
    isArray: true,
  })
  @Roles(Role.EDITOR)
  @Get('owner-options')
  async listOwnerOptions(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<OwnerOptionResponseDto[]> {
    const options = await this.usersService.listOwnerOptions(currentUser);

    return options.map((option) =>
      plainToInstance(OwnerOptionResponseDto, option),
    );
  }

  @ApiOperation({ summary: 'List all available process owners' })
  @ApiOkResponse({
    description: 'All owner options available in the tenant.',
    type: OwnerOptionResponseDto,
    isArray: true,
  })
  @Roles(Role.EDITOR)
  @Get('owner-options/all')
  async listAllOwnerOptions(): Promise<OwnerOptionResponseDto[]> {
    const options = await this.usersService.listAllOwnerOptions();

    return options.map((option) =>
      plainToInstance(OwnerOptionResponseDto, option),
    );
  }

  @ApiOperation({
    summary: 'List available process owners for an active team',
  })
  @ApiParam({
    name: 'id',
    description: 'Active team UUID used to filter owner options.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Owner options available for the requested active team.',
    type: OwnerOptionResponseDto,
    isArray: true,
  })
  @Roles(Role.EDITOR)
  @Get('owner-options/team/:id')
  async listOwnerOptionsByTeamId(
    @Param() params: IdParamDto,
  ): Promise<OwnerOptionResponseDto[]> {
    const options = await this.usersService.listOwnerOptionsByTeamId(params.id);

    return options.map((option) =>
      plainToInstance(OwnerOptionResponseDto, option),
    );
  }

  @ApiOperation({
    summary: 'List selectable active teams for user and ownership forms',
  })
  @ApiOkResponse({
    description:
      'Active team options that can be assigned to users or records.',
    type: TeamOptionResponseDto,
    isArray: true,
  })
  @Roles(Role.EDITOR, Role.SYSTEM_ADMIN)
  @Get('team-options')
  async listTeamOptions(): Promise<TeamOptionResponseDto[]> {
    const teams = await this.usersService.listTeamOptions();

    return teams.map((team) => plainToInstance(TeamOptionResponseDto, team));
  }

  @ApiOperation({ summary: 'List technical users' })
  @ApiOkResponse({
    description: 'Technical users configured in the system.',
    type: UserResponseDto,
    isArray: true,
  })
  @Roles(Role.SYSTEM_ADMIN)
  @Get()
  async list(): Promise<UserResponseDto[]> {
    const users = await this.usersService.list();

    return users.map((user) => this.toDto(user));
  }

  @ApiOperation({ summary: 'Get a technical user by id' })
  @ApiParam({
    name: 'id',
    description: 'Technical user UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Requested technical user record.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Technical user not found.' })
  @Roles(Role.SYSTEM_ADMIN)
  @Get(':id')
  async getById(@Param() params: IdParamDto): Promise<UserResponseDto> {
    return this.toDto(await this.usersService.getById(params.id));
  }

  @ApiOperation({ summary: 'Create a technical user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'Technical user created successfully.',
    type: UserResponseDto,
  })
  @Roles(Role.SYSTEM_ADMIN)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.toDto(
      await this.usersService.create(createUserDto, currentUser),
    );
  }

  @ApiOperation({ summary: 'Update a technical user' })
  @ApiParam({
    name: 'id',
    description: 'Technical user UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'Technical user updated successfully.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Technical user not found.' })
  @Roles(Role.SYSTEM_ADMIN)
  @Patch(':id')
  async update(
    @Param() params: IdParamDto,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.toDto(
      await this.usersService.update(params.id, updateUserDto, currentUser),
    );
  }

  @ApiOperation({ summary: 'Deactivate a technical user' })
  @ApiParam({
    name: 'id',
    description: 'Technical user UUID.',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Technical user deactivated successfully.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Technical user not found.' })
  @Roles(Role.SYSTEM_ADMIN)
  @Patch(':id/deactivate')
  async deactivate(
    @Param() params: IdParamDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.toDto(
      await this.usersService.deactivate(params.id, currentUser),
    );
  }

  @ApiOperation({ summary: 'Reset a technical user password' })
  @ApiParam({
    name: 'id',
    description: 'Technical user UUID.',
    format: 'uuid',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    description: 'Technical user password reset successfully.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Technical user not found.' })
  @Roles(Role.SYSTEM_ADMIN)
  @Patch(':id/reset-password')
  async resetPassword(
    @Param() params: IdParamDto,
    @Body() resetPasswordDto: ResetPasswordDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.toDto(
      await this.usersService.resetPassword(
        params.id,
        resetPasswordDto,
        currentUser,
      ),
    );
  }

  private toDto(user: UserAdminRecord): UserResponseDto {
    return plainToInstance(UserResponseDto, user);
  }
}
