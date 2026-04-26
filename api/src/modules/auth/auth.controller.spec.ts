import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { Role } from '../../common/enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Pick<AuthService, 'login' | 'getAuthenticatedUserById'> & {
    login: jest.Mock;
    getAuthenticatedUserById: jest.Mock;
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
    authService = {
      login: jest.fn(),
      getAuthenticatedUserById: jest.fn(),
    };

    controller = new AuthController(authService as unknown as AuthService);
  });

  it('should login and return token', async () => {
    const mockResponse = {
      accessToken: 'jwt-token',
      tokenType: 'Bearer' as const,
      expiresIn: 3600,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
    authService.login.mockResolvedValue(mockResponse);

    const result = await controller.login({
      email: 'test@example.com',
      password: 'password',
    });

    expect(result).toEqual(mockResponse);
    expect(authService.login).toHaveBeenCalledWith(
      'test@example.com',
      'password',
    );
  });

  it('should return current user info', () => {
    const result = controller.getMe(mockUser);

    expect(result).toEqual({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: {
        id: 'role-1',
        name: Role.EDITOR,
      },
      team: {
        id: 'team-1',
        code: 'HR',
        name: 'Human Resources',
      },
    });
  });

  it('should throw error when login fails', async () => {
    const error = new Error('Invalid credentials');
    authService.login.mockRejectedValue(error);

    await expect(
      controller.login({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw error when user not found during login', async () => {
    const error = new Error('User not found');
    authService.login.mockRejectedValue(error);

    await expect(
      controller.login({
        email: 'nonexistent@example.com',
        password: 'password',
      }),
    ).rejects.toThrow('User not found');
  });
});
