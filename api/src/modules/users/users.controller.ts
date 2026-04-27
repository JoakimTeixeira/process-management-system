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

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { IdParamDto } from '../../common/dto/uuid-param.dto';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { OwnerOptionResponseDto } from './dto/owner-option-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TeamOptionResponseDto } from './dto/team-option-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import type { UserAdminRecord } from './users.repository';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Roles(Role.EDITOR)
  @Get('owner-options/all')
  async listAllOwnerOptions(): Promise<OwnerOptionResponseDto[]> {
    const options = await this.usersService.listAllOwnerOptions();

    return options.map((option) =>
      plainToInstance(OwnerOptionResponseDto, option),
    );
  }

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

  @Roles(Role.EDITOR)
  @Get('team-options')
  async listTeamOptions(): Promise<TeamOptionResponseDto[]> {
    const teams = await this.usersService.listTeamOptions();

    return teams.map((team) => plainToInstance(TeamOptionResponseDto, team));
  }

  @Roles(Role.SYSTEM_ADMIN)
  @Get()
  async list(): Promise<UserResponseDto[]> {
    const users = await this.usersService.list();

    return users.map((user) => this.toDto(user));
  }

  @Roles(Role.SYSTEM_ADMIN)
  @Get(':id')
  async getById(@Param() params: IdParamDto): Promise<UserResponseDto> {
    return this.toDto(await this.usersService.getById(params.id));
  }

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
