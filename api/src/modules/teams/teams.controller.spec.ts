import { GUARDS_METADATA } from '@nestjs/common/constants';

import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { TeamsController } from './teams.controller';
import type { TeamsService } from './teams.service';

type ControllerMethod = (...args: never[]) => unknown;

function getControllerMethod(target: object, key: string): ControllerMethod {
  const method: unknown = Object.getOwnPropertyDescriptor(target, key)?.value;

  if (typeof method !== 'function') {
    throw new TypeError(`Expected "${key}" to be a controller method`);
  }

  return method as ControllerMethod;
}

describe('TeamsController metadata', () => {
  it('should protect the controller with JWT and roles guards', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, TeamsController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
  });

  it('should restrict all team administration endpoints to SYSTEM_ADMIN', () => {
    for (const methodName of [
      'list',
      'getById',
      'create',
      'update',
      'deactivate',
    ]) {
      expect(
        Reflect.getMetadata(
          ROLES_KEY,
          getControllerMethod(TeamsController.prototype, methodName),
        ),
      ).toEqual([Role.SYSTEM_ADMIN]);
    }
  });
});

describe('TeamsController', () => {
  let controller: TeamsController;
  let teamsService: jest.Mocked<
    Pick<TeamsService, 'list' | 'getById' | 'create' | 'update' | 'deactivate'>
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
    teamsService = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
    };

    controller = new TeamsController(teamsService as unknown as TeamsService);
  });

  it('should delegate list requests', async () => {
    teamsService.list.mockResolvedValue([
      {
        id: 'team-1',
        code: 'OPS',
        name: 'Operations',
        description: 'Operations team',
        isActive: true,
      },
    ]);

    await controller.list();

    expect(teamsService.list).toHaveBeenCalled();
  });

  it('should delegate create requests', async () => {
    const team = {
      id: 'team-1',
      code: 'OPS',
      name: 'Operations',
      description: 'Operations team',
      isActive: true,
    };
    teamsService.create.mockResolvedValue(team);

    await controller.create(
      {
        code: 'OPS',
        name: 'Operations',
        description: 'Operations team',
      },
      currentUser,
    );

    expect(teamsService.create).toHaveBeenCalledWith(
      {
        code: 'OPS',
        name: 'Operations',
        description: 'Operations team',
      },
      currentUser,
    );
  });

  it('should delegate update requests', async () => {
    teamsService.update.mockResolvedValue({
      id: 'team-1',
      code: 'OPS',
      name: 'Operations and Support',
      description: 'Updated team',
      isActive: true,
    });

    await controller.update(
      { id: 'team-1' },
      { name: 'Operations and Support' },
      currentUser,
    );

    expect(teamsService.update).toHaveBeenCalledWith(
      'team-1',
      { name: 'Operations and Support' },
      currentUser,
    );
  });

  it('should delegate deactivate requests', async () => {
    teamsService.deactivate.mockResolvedValue({
      id: 'team-1',
      code: 'OPS',
      name: 'Operations',
      description: 'Operations team',
      isActive: false,
    });

    await controller.deactivate({ id: 'team-1' }, currentUser);

    expect(teamsService.deactivate).toHaveBeenCalledWith('team-1', currentUser);
  });
});
