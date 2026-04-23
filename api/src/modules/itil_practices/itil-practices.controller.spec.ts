import { GUARDS_METADATA } from '@nestjs/common/constants';

import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ItilPracticesController } from './itil-practices.controller';

type ControllerMethod = (...args: never[]) => unknown;

function getControllerMethod(target: object, key: string): ControllerMethod {
  const method: unknown = Object.getOwnPropertyDescriptor(target, key)?.value;

  if (typeof method !== 'function') {
    throw new TypeError(`Expected "${key}" to be a controller method`);
  }

  return method as ControllerMethod;
}

describe('ItilPracticesController metadata', () => {
  it('protects the controller with JWT and roles guards', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, ItilPracticesController),
    ).toEqual([JwtAuthGuard, RolesGuard]);
  });

  it('restricts create to EDITOR', () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getControllerMethod(ItilPracticesController.prototype, 'create'),
      ),
    ).toEqual([Role.EDITOR]);
  });

  it('leaves list role-open', () => {
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getControllerMethod(ItilPracticesController.prototype, 'list'),
      ),
    ).toBeUndefined();
  });
});
