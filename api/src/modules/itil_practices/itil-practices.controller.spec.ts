import { GUARDS_METADATA } from '@nestjs/common/constants';

import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ItilPracticesController } from './itil-practices.controller';
import { ItilPracticesService } from './itil-practices.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

type ControllerMethod = (...args: never[]) => unknown;

function getControllerMethod(target: object, key: string): ControllerMethod {
  const method: unknown = Object.getOwnPropertyDescriptor(target, key)?.value;

  if (typeof method !== 'function') {
    throw new TypeError(`Expected "${key}" to be a controller method`);
  }

  return method as ControllerMethod;
}

describe('ItilPracticesController metadata', () => {
  it('should protect the controller with JWT and roles guards', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, ItilPracticesController),
    ).toEqual([JwtAuthGuard, RolesGuard]);
  });

  it('should restrict create to EDITOR', () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getControllerMethod(ItilPracticesController.prototype, 'create'),
      ),
    ).toEqual([Role.EDITOR]);
  });

  it('should leave list role-open', () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getControllerMethod(ItilPracticesController.prototype, 'list'),
      ),
    ).toBeUndefined();
  });
});

describe('ItilPracticesController', () => {
  let controller: ItilPracticesController;
  let itilPracticesService: ItilPracticesService & {
    create: jest.Mock;
    list: jest.Mock;
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
    itilPracticesService = {
      create: jest.fn(),
      list: jest.fn(),
    } as ItilPracticesService & {
      create: jest.Mock;
      list: jest.Mock;
    };

    controller = new ItilPracticesController(itilPracticesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call itilPracticesService.create', async () => {
    const createItilPracticeDto = { code: 'SS', name: 'Service Strategy' };
    const mockPractice = {
      id: 'practice-1',
      code: 'SS',
      name: 'Service Strategy',
      description: null,
    };
    itilPracticesService.create.mockResolvedValue(mockPractice);

    await controller.create(createItilPracticeDto, mockUser);

    expect(itilPracticesService.create).toHaveBeenCalledWith(
      createItilPracticeDto,
      mockUser,
    );
  });

  it('should call itilPracticesService.list', async () => {
    const mockPractices = [
      {
        id: 'practice-1',
        code: 'SS',
        name: 'Service Strategy',
        description: null,
      },
    ];
    itilPracticesService.list.mockResolvedValue(mockPractices);

    await controller.list();

    expect(itilPracticesService.list).toHaveBeenCalled();
  });

  it('should throw error when itilPracticesService.create fails', async () => {
    const createItilPracticeDto = { code: 'SS', name: 'Service Strategy' };
    itilPracticesService.create.mockRejectedValue(new Error('Database error'));

    await expect(
      controller.create(createItilPracticeDto, mockUser),
    ).rejects.toThrow('Database error');
  });

  it('should throw error when itilPracticesService.list fails', async () => {
    itilPracticesService.list.mockRejectedValue(new Error('Database error'));

    await expect(controller.list()).rejects.toThrow('Database error');
  });
});
