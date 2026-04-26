import { UnauthorizedException } from '@nestjs/common';

import type { AuthConfig } from '../../../config/auth.config';
import { Role } from '../../../common/enums/role.enum';
import { TEST_TOKEN_EXPIRES_IN_SECONDS_SHORT } from '../../../common/constants/workflow.constants';
import type { AuthService } from '../auth.service';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const authConfiguration: AuthConfig = {
    passwordPepper: 'pepper',
    jwtSecret: 'secret',
    jwtExpiresIn: '15m',
    jwtExpiresInSeconds: TEST_TOKEN_EXPIRES_IN_SECONDS_SHORT,
  };
  const payload: JwtPayload = {
    sub: 'user-1',
    email: 'editor@example.com',
  };

  let authService: jest.Mocked<Pick<AuthService, 'getAuthenticatedUserById'>>;
  let strategy: JwtStrategy;

  beforeEach(() => {
    authService = {
      getAuthenticatedUserById: jest.fn(),
    };
    strategy = new JwtStrategy(authConfiguration, authService);
  });

  it('should reload the current user by payload.sub and return request.user data', async () => {
    const user = createAuthenticatedUser(Role.EDITOR);

    authService.getAuthenticatedUserById.mockResolvedValue(user);

    await expect(strategy.validate(payload)).resolves.toEqual(user);
    expect(authService.getAuthenticatedUserById).toHaveBeenCalledWith('user-1');
  });

  it('should reflect role changes on the next authenticated request', async () => {
    authService.getAuthenticatedUserById
      .mockResolvedValueOnce(createAuthenticatedUser(Role.EDITOR))
      .mockResolvedValueOnce(createAuthenticatedUser(Role.REVIEWER));

    await expect(strategy.validate(payload)).resolves.toMatchObject({
      role: Role.EDITOR,
    });
    await expect(strategy.validate(payload)).resolves.toMatchObject({
      role: Role.REVIEWER,
    });
  });

  it('should reject deactivated users on the next authenticated request', async () => {
    authService.getAuthenticatedUserById
      .mockResolvedValueOnce(createAuthenticatedUser(Role.EDITOR))
      .mockResolvedValueOnce(null);

    await expect(strategy.validate(payload)).resolves.toMatchObject({
      role: Role.EDITOR,
    });
    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

function createAuthenticatedUser(role: Role): AuthenticatedUser {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'editor@example.com',
    roleId: 'role-1',
    role,
    team: null,
  };
}
