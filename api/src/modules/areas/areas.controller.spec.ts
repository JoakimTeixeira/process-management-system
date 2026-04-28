import { GUARDS_METADATA } from '@nestjs/common/constants';

import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AreasController } from './areas.controller';
import { AreasService } from './areas.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

type ControllerMethod = (...args: never[]) => unknown;

function getControllerMethod(target: object, key: string): ControllerMethod {
  const method: unknown = Object.getOwnPropertyDescriptor(target, key)?.value;

  if (typeof method !== 'function') {
    throw new TypeError(`Expected "${key}" to be a controller method`);
  }

  return method as ControllerMethod;
}

describe('AreasController metadata', () => {
  it('should protect the controller with JWT and roles guards', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, AreasController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
  });

  it('should restrict create and update to EDITOR', () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getControllerMethod(AreasController.prototype, 'create'),
      ),
    ).toEqual([Role.EDITOR]);
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getControllerMethod(AreasController.prototype, 'update'),
      ),
    ).toEqual([Role.EDITOR]);
  });

  it('should restrict list and getById to content roles', () => {
    for (const methodName of ['list', 'getById']) {
      expect(
        Reflect.getMetadata(
          ROLES_KEY,
          getControllerMethod(AreasController.prototype, methodName),
        ),
      ).toEqual([Role.EDITOR, Role.REVIEWER, Role.PUBLISHER, Role.VIEWER]);
    }
  });
});

describe('AreasController', () => {
  let controller: AreasController;
  let areasService: AreasService & {
    create: jest.Mock;
    list: jest.Mock;
    getById: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockUser: AuthenticatedUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    roleId: 'role-1',
    role: Role.EDITOR,
    team: {
      id: 'team-1',
      code: 'HR',
      name: 'Human Resources',
    },
  };

  beforeEach(() => {
    areasService = {
      create: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as AreasService & {
      create: jest.Mock;
      list: jest.Mock;
      getById: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };

    controller = new AreasController(areasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call areasService.create', async () => {
    const createAreaDto = {
      title: 'Human Resources',
      description: 'Test description',
      teamId: 'team-1',
      ownerId: 'user-1',
      itilPracticeId: 'practice-1',
    };
    const mockArea = {
      id: 'area-1',
      code: 'HR',
      title: 'Human Resources',
      description: null,
      ownerId: 'user-1',
      itilPracticeId: 'practice-1',
      itilPracticeName: 'Service Strategy',
    };
    areasService.create.mockResolvedValue(mockArea);

    await controller.create(createAreaDto, mockUser);

    expect(areasService.create).toHaveBeenCalledWith(createAreaDto, mockUser);
  });

  it('should call areasService.list', async () => {
    const mockAreas = [
      {
        id: 'area-1',
        code: 'HR',
        title: 'Human Resources',
        description: null,
        ownerId: 'user-1',
        itilPracticeId: 'practice-1',
        itilPracticeName: 'Service Strategy',
      },
    ];
    areasService.list.mockResolvedValue(mockAreas);

    await controller.list();

    expect(areasService.list).toHaveBeenCalled();
  });

  it('should call areasService.getById', async () => {
    const mockArea = {
      id: 'area-1',
      code: 'HR',
      title: 'Human Resources',
      description: null,
      ownerId: 'user-1',
      itilPracticeId: 'practice-1',
      itilPracticeName: 'Service Strategy',
    };
    areasService.getById.mockResolvedValue(mockArea);

    await controller.getById({ id: 'area-1' });

    expect(areasService.getById).toHaveBeenCalledWith('area-1');
  });

  it('should call areasService.update', async () => {
    const updateAreaDto = { title: 'Updated Title' };
    const mockArea = {
      id: 'area-1',
      code: 'HR',
      title: 'Updated Title',
      description: null,
      ownerId: 'user-1',
      itilPracticeId: 'practice-1',
      itilPracticeName: 'Service Strategy',
    };
    areasService.update.mockResolvedValue(mockArea);

    await controller.update({ id: 'area-1' }, updateAreaDto, mockUser);

    expect(areasService.update).toHaveBeenCalledWith(
      'area-1',
      updateAreaDto,
      mockUser,
    );
  });

  it('should call areasService.delete', async () => {
    areasService.delete.mockResolvedValue(undefined);

    await controller.delete({ id: 'area-1' }, mockUser);

    expect(areasService.delete).toHaveBeenCalledWith('area-1', mockUser);
  });

  it('should throw error when areasService.create fails', async () => {
    const createAreaDto = {
      title: 'Human Resources',
      description: 'Test description',
      teamId: 'team-1',
      ownerId: 'user-1',
      itilPracticeId: 'practice-1',
    };
    areasService.create.mockRejectedValue(new Error('Database error'));

    await expect(controller.create(createAreaDto, mockUser)).rejects.toThrow(
      'Database error',
    );
  });

  it('should throw error when areasService.list fails', async () => {
    areasService.list.mockRejectedValue(new Error('Database error'));

    await expect(controller.list()).rejects.toThrow('Database error');
  });

  it('should throw error when areasService.getById fails', async () => {
    areasService.getById.mockRejectedValue(new Error('Database error'));

    await expect(controller.getById({ id: 'area-1' })).rejects.toThrow(
      'Database error',
    );
  });

  it('should throw error when areasService.update fails', async () => {
    const updateAreaDto = { title: 'Updated Title' };
    areasService.update.mockRejectedValue(new Error('Database error'));

    await expect(
      controller.update({ id: 'area-1' }, updateAreaDto, mockUser),
    ).rejects.toThrow('Database error');
  });

  it('should throw error when areasService.delete fails', async () => {
    areasService.delete.mockRejectedValue(new Error('Database error'));

    await expect(controller.delete({ id: 'area-1' }, mockUser)).rejects.toThrow(
      'Database error',
    );
  });
});
