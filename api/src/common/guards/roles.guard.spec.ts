import type { ExecutionContext, Type } from '@nestjs/common';
import type {
  HttpArgumentsHost,
  RpcArgumentsHost,
  WsArgumentsHost,
} from '@nestjs/common/interfaces/features/arguments-host.interface';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { RolesGuard } from './roles.guard';

class NoRolesController {
  handler(): void {
    return undefined;
  }
}

@Roles(Role.EDITOR)
class EditorOnlyController {
  handler(): void {
    return undefined;
  }
}

@Roles(Role.VIEWER)
class ClassRoleController {
  handler(): void {
    return undefined;
  }

  @Roles(Role.REVIEWER)
  reviewerHandler(): void {
    return undefined;
  }
}

type RequestUser = Omit<AuthenticatedUser, 'role'> & {
  role?: AuthenticatedUser['role'];
};

class MockExecutionContext implements ExecutionContext {
  private readonly controller: Record<string, unknown>;
  private readonly handlerName: string;
  private readonly request: { user?: RequestUser };

  constructor(
    controller: Record<string, unknown>,
    handlerName: string,
    request: { user?: RequestUser } = {},
  ) {
    this.controller = controller;
    this.handlerName = handlerName;
    this.request = request;
  }

  getClass<T = unknown>(): Type<T> {
    return this.controller.constructor as Type<T>;
  }

  getHandler(): (...args: unknown[]) => unknown {
    return this.controller[this.handlerName] as (...args: unknown[]) => unknown;
  }

  getArgs<T extends Array<unknown> = Array<unknown>>(): T {
    return [this.request] as unknown as T;
  }

  getArgByIndex<T = unknown>(index: number): T {
    return this.getArgs()[index] as T;
  }

  switchToHttp(): HttpArgumentsHost {
    return {
      getRequest: <T = unknown>() => this.request as T,
      getResponse: <T = unknown>() => undefined as T,
      getNext: <T = unknown>() => undefined as T,
    };
  }

  switchToRpc(): RpcArgumentsHost {
    return {
      getData: <T = unknown>() => undefined as T,
      getContext: <T = unknown>() => undefined as T,
    };
  }

  switchToWs(): WsArgumentsHost {
    return {
      getClient: <T = unknown>() => undefined as T,
      getData: <T = unknown>() => undefined as T,
      getPattern: () => '',
    };
  }

  getType<TContext extends string = 'http'>(): TContext {
    return 'http' as TContext;
  }
}

function createExecutionContext(
  controller: object,
  handlerName: string,
  request: { user?: RequestUser } = {},
): ExecutionContext {
  return new MockExecutionContext(
    controller as Record<string, unknown>,
    handlerName,
    request,
  );
}

function createAuthenticatedUser(role: Role): AuthenticatedUser {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    roleId: 'role-1',
    role,
    team: null,
  };
}

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(new Reflector());
  });

  it('should allow access when no roles metadata exists', () => {
    const controller = new NoRolesController();
    const context = createExecutionContext(controller, 'handler');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access for a matching role', () => {
    const controller = new EditorOnlyController();
    const context = createExecutionContext(controller, 'handler', {
      user: createAuthenticatedUser(Role.EDITOR),
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access for a non-matching role', () => {
    const controller = new EditorOnlyController();
    const context = createExecutionContext(controller, 'handler', {
      user: createAuthenticatedUser(Role.VIEWER),
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when request.user is missing', () => {
    const controller = new EditorOnlyController();
    const context = createExecutionContext(controller, 'handler');

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when request.user.role is missing', () => {
    const controller = new EditorOnlyController();
    const context = createExecutionContext(controller, 'handler', {
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        roleId: 'role-1',
        team: null,
      },
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should honor method-level metadata overriding class-level metadata', () => {
    const controller = new ClassRoleController();
    const reviewerContext = createExecutionContext(
      controller,
      'reviewerHandler',
      {
        user: createAuthenticatedUser(Role.REVIEWER),
      },
    );
    const viewerContext = createExecutionContext(
      controller,
      'reviewerHandler',
      {
        user: createAuthenticatedUser(Role.VIEWER),
      },
    );

    expect(guard.canActivate(reviewerContext)).toBe(true);
    expect(guard.canActivate(viewerContext)).toBe(false);
  });

  it('should perform an in-memory comparison against request.user.role only', () => {
    const controller = new EditorOnlyController();
    let roleAccessCount = 0;
    let otherAccessCount = 0;

    const context = createExecutionContext(controller, 'handler', {
      user: {
        get role() {
          roleAccessCount += 1;
          return Role.EDITOR;
        },
        get id() {
          otherAccessCount += 1;
          return 'user-1';
        },
        get name() {
          otherAccessCount += 1;
          return 'Test User';
        },
        get email() {
          otherAccessCount += 1;
          return 'test@example.com';
        },
        get roleId() {
          otherAccessCount += 1;
          return 'role-1';
        },
        get team() {
          otherAccessCount += 1;
          return null;
        },
      },
    });

    expect(guard.canActivate(context)).toBe(true);
    expect(roleAccessCount).toBe(1);
    expect(otherAccessCount).toBe(0);
  });
});
