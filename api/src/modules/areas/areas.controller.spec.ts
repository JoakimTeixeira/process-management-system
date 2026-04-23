import { GUARDS_METADATA } from '@nestjs/common/constants';

import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AreasController } from './areas.controller';

type ControllerMethod = (...args: never[]) => unknown;

function getControllerMethod(target: object, key: string): ControllerMethod {
  const method: unknown = Object.getOwnPropertyDescriptor(target, key)?.value;

  if (typeof method !== 'function') {
    throw new TypeError(`Expected "${key}" to be a controller method`);
  }

  return method as ControllerMethod;
}

describe('AreasController metadata', () => {
  it('protects the controller with JWT and roles guards', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, AreasController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
  });

  it('restricts create and update to EDITOR', () => {
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

  it('leaves list and getById role-open', () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getControllerMethod(AreasController.prototype, 'list'),
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getControllerMethod(AreasController.prototype, 'getById'),
      ),
    ).toBeUndefined();
  });
});
