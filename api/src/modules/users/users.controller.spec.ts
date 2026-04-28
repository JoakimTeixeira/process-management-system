import { GUARDS_METADATA } from '@nestjs/common/constants';

import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

type ControllerMethod = (...args: never[]) => unknown;

function getControllerMethod(target: object, key: string): ControllerMethod {
  const method: unknown = Object.getOwnPropertyDescriptor(target, key)?.value;

  if (typeof method !== 'function') {
    throw new TypeError(`Expected "${key}" to be a controller method`);
  }

  return method as ControllerMethod;
}

describe('UsersController metadata', () => {
  it('should protect the controller with JWT and roles guards', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, UsersController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
  });

  it('should expose owner options to EDITOR only', () => {
    for (const methodName of [
      'listOwnerOptions',
      'listAllOwnerOptions',
      'listOwnerOptionsByTeamId',
    ]) {
      expect(
        Reflect.getMetadata(
          ROLES_KEY,
          getControllerMethod(UsersController.prototype, methodName),
        ),
      ).toEqual([Role.EDITOR]);
    }
  });

  it('should expose team options to EDITOR and SYSTEM_ADMIN', () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getControllerMethod(UsersController.prototype, 'listTeamOptions'),
      ),
    ).toEqual([Role.EDITOR, Role.SYSTEM_ADMIN]);
  });

  it('should expose user admin methods to SYSTEM_ADMIN only', () => {
    for (const methodName of [
      'list',
      'getById',
      'create',
      'update',
      'deactivate',
      'resetPassword',
    ]) {
      expect(
        Reflect.getMetadata(
          ROLES_KEY,
          getControllerMethod(UsersController.prototype, methodName),
        ),
      ).toEqual([Role.SYSTEM_ADMIN]);
    }
  });
});

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<
    Pick<
      UsersService,
      | 'listOwnerOptions'
      | 'listAllOwnerOptions'
      | 'listOwnerOptionsByTeamId'
      | 'listTeamOptions'
      | 'list'
      | 'getById'
      | 'create'
      | 'update'
      | 'deactivate'
      | 'resetPassword'
    >
  >;

  const currentUser: AuthenticatedUser = {
    id: 'user-1',
    name: 'Sam Admin',
    email: 'sam.admin@example.com',
    roleId: 'role-1',
    role: Role.SYSTEM_ADMIN,
    team: {
      id: 'team-1',
      code: 'OPS',
      name: 'Operations',
    },
  };

  beforeEach(() => {
    usersService = {
      listOwnerOptions: jest.fn(),
      listAllOwnerOptions: jest.fn(),
      listOwnerOptionsByTeamId: jest.fn(),
      listTeamOptions: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
      resetPassword: jest.fn(),
    };

    controller = new UsersController(usersService as unknown as UsersService);
  });

  it('should delegate owner options lookup', async () => {
    usersService.listOwnerOptions.mockResolvedValue([
      { id: 'u1', name: 'Alice', teamId: 'team-1', isActive: true },
    ]);

    await controller.listOwnerOptions(currentUser);

    expect(usersService.listOwnerOptions).toHaveBeenCalledWith(currentUser);
  });

  it('should delegate team-scoped owner options lookup', async () => {
    usersService.listOwnerOptionsByTeamId.mockResolvedValue([
      { id: 'u2', name: 'Bob', teamId: 'team-2', isActive: true },
    ]);

    await controller.listOwnerOptionsByTeamId({ id: 'team-2' });

    expect(usersService.listOwnerOptionsByTeamId).toHaveBeenCalledWith(
      'team-2',
    );
  });

  it('should delegate password reset', async () => {
    usersService.resetPassword.mockResolvedValue({
      id: 'user-2',
      name: 'Alice',
      email: 'alice@example.com',
      isActive: true,
      role: { id: 'role-2', name: Role.EDITOR },
      team: { id: 'team-2', code: 'HR', name: 'Human Resources' },
    });

    await controller.resetPassword(
      { id: 'user-2' },
      { newPassword: 'temporaryPassword123' },
      currentUser,
    );

    expect(usersService.resetPassword).toHaveBeenCalledWith(
      'user-2',
      { newPassword: 'temporaryPassword123' },
      currentUser,
    );
  });
});
