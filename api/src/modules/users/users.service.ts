import * as argon2 from 'argon2';

import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import authConfig from '../../config/auth.config';
import { isUniqueViolationError } from '../../common/utils/postgres-error.util';
import { Role } from '../../common/enums/role.enum';
import { AuditLogWriterService } from '../audit/audit-log-writer.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { CreateUserDto } from './dto/create-user.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type {
  OwnerOptionRecord,
  TeamOptionRecord,
  UserAdminRecord,
} from './users.repository';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly auditLogWriterService: AuditLogWriterService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
  ) {}

  async listOwnerOptions(
    currentUser: AuthenticatedUser,
  ): Promise<OwnerOptionRecord[]> {
    if (!currentUser.team?.id) {
      return [];
    }

    return await this.listOwnerOptionsByTeamId(currentUser.team.id);
  }

  async listOwnerOptionsByTeamId(teamId: string): Promise<OwnerOptionRecord[]> {
    await this.ensureTeamExists(teamId);

    return await this.usersRepository.findOwnerOptionsByTeamId(teamId);
  }

  async listAllOwnerOptions(): Promise<OwnerOptionRecord[]> {
    return await this.usersRepository.findAllOwnerOptions();
  }

  async listTeamOptions(): Promise<TeamOptionRecord[]> {
    return await this.usersRepository.findTeamOptions();
  }

  async list(): Promise<UserAdminRecord[]> {
    return await this.usersRepository.findAll();
  }

  async getById(id: string): Promise<UserAdminRecord> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(
    createUserDto: CreateUserDto,
    currentUser: AuthenticatedUser,
  ): Promise<UserAdminRecord> {
    await this.ensureTeamExists(createUserDto.teamId);
    const role = await this.resolveRole(
      createUserDto.roleId,
      createUserDto.roleName,
    );
    const passwordHash = await this.hashPassword(createUserDto.password);

    try {
      const user = await this.usersRepository.create({
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
        roleId: role.id,
        teamId: createUserDto.teamId,
      });

      await this.auditLogWriterService.create({
        entityType: 'user',
        entityId: user.id,
        action: 'USER_CREATE',
        actorId: currentUser.id,
        reasonForChange: 'Created user via SYSTEM_ADMIN',
        newData: user,
      });

      return user;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(
          'A user with the same email already exists',
        );
      }

      throw error;
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: AuthenticatedUser,
  ): Promise<UserAdminRecord> {
    const currentRecord = await this.getById(id);
    const updateInput: {
      name?: string;
      email?: string;
      roleId?: string;
      teamId?: string;
      isActive?: boolean;
    } = {};

    if (updateUserDto.name !== undefined) {
      updateInput.name = updateUserDto.name;
    }

    if (updateUserDto.email !== undefined) {
      updateInput.email = updateUserDto.email;
    }

    if (updateUserDto.teamId !== undefined) {
      await this.ensureTeamExists(updateUserDto.teamId);
      updateInput.teamId = updateUserDto.teamId;
    }

    if (
      updateUserDto.roleId !== undefined ||
      updateUserDto.roleName !== undefined
    ) {
      const role = await this.resolveRole(
        updateUserDto.roleId,
        updateUserDto.roleName,
      );
      updateInput.roleId = role.id;
    }

    if (updateUserDto.isActive !== undefined) {
      updateInput.isActive = updateUserDto.isActive;
    }

    try {
      const updatedUser = await this.usersRepository.update(id, updateInput);

      await this.auditLogWriterService.create({
        entityType: 'user',
        entityId: updatedUser.id,
        action: 'USER_UPDATE',
        actorId: currentUser.id,
        reasonForChange: 'Updated user via SYSTEM_ADMIN',
        oldData: currentRecord,
        newData: updatedUser,
      });

      return updatedUser;
    } catch (error: unknown) {
      if (isUniqueViolationError(error)) {
        throw new ConflictException(
          'A user with the same email already exists',
        );
      }

      throw error;
    }
  }

  async deactivate(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<UserAdminRecord> {
    const currentRecord = await this.getById(id);
    const updatedUser = await this.usersRepository.update(id, {
      isActive: false,
    });

    await this.auditLogWriterService.create({
      entityType: 'user',
      entityId: updatedUser.id,
      action: 'USER_DEACTIVATE',
      actorId: currentUser.id,
      reasonForChange: 'Deactivated user via SYSTEM_ADMIN',
      oldData: currentRecord,
      newData: updatedUser,
    });

    return updatedUser;
  }

  async resetPassword(
    id: string,
    resetPasswordDto: ResetPasswordDto,
    currentUser: AuthenticatedUser,
  ): Promise<UserAdminRecord> {
    const currentRecord = await this.getById(id);
    const passwordHash = await this.hashPassword(resetPasswordDto.newPassword);
    const updatedUser = await this.usersRepository.updatePasswordHash(
      id,
      passwordHash,
    );

    await this.auditLogWriterService.create({
      entityType: 'user',
      entityId: updatedUser.id,
      action: 'USER_UPDATE',
      actorId: currentUser.id,
      reasonForChange: 'Reset user password via SYSTEM_ADMIN',
      oldData: currentRecord,
      newData: {
        ...updatedUser,
        passwordReset: true,
      },
    });

    return updatedUser;
  }

  private async resolveRole(roleId?: string, roleName?: Role | string) {
    if (roleId) {
      const role = await this.usersRepository.findRoleById(roleId);

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      return role;
    }

    if (roleName) {
      const role = await this.usersRepository.findRoleByName(roleName as Role);

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      return role;
    }

    throw new ConflictException('roleId or roleName must be provided');
  }

  private async ensureTeamExists(teamId: string): Promise<void> {
    const exists = await this.usersRepository.teamExists(teamId);

    if (!exists) {
      throw new NotFoundException('Team not found');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
      secret: Buffer.from(this.authConfiguration.passwordPepper, 'utf8'),
    });
  }
}
