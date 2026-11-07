import type { MockedFunction, MockInstance } from 'vitest';

import * as argon2 from 'argon2';
import type { DataSource } from 'typeorm';

import type { AuthConfig } from '../../config/auth.config';
import { Role } from '../../common/enums/role.enum';
import { TEST_TOKEN_EXPIRES_IN_SECONDS_SHORT } from '../../common/constants/workflow.constants';
import { AuthRepository } from './auth.repository';
import type { AuthRepositoryUser } from './auth.repository';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';

vi.mock('argon2', () => ({
  verify: vi.fn(),
}));

describe('AuthService', () => {
  const email = 'editor@example.com';
  const password = 'password';
  const authConfiguration: AuthConfig = {
    passwordPepper: 'pepper',
    jwtSecret: 'secret',
    jwtExpiresIn: '15m',
    jwtExpiresInSeconds: TEST_TOKEN_EXPIRES_IN_SECONDS_SHORT,
  };

  let authRepository: AuthRepository;
  let findUserByEmailSpy: MockInstance<AuthRepository['findUserByEmail']>;
  let findUserByIdSpy: MockInstance<AuthRepository['findUserById']>;
  let jwtSigner: {
    signAsync: MockedFunction<(payload: JwtPayload) => Promise<string>>;
  };
  let authService: AuthService;

  beforeEach(() => {
    authRepository = new AuthRepository({} as DataSource);
    findUserByEmailSpy = vi.spyOn(authRepository, 'findUserByEmail');
    findUserByIdSpy = vi.spyOn(authRepository, 'findUserById');
    jwtSigner = {
      signAsync: vi
        .fn<Promise<string>, [JwtPayload]>()
        .mockResolvedValue('signed-token'),
    };
    authService = new AuthService(authRepository, authConfiguration, jwtSigner);
    vi.spyOn(authService['logger'], 'log').mockImplementation();
    vi.spyOn(authService['logger'], 'warn').mockImplementation();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should sign a minimal jwt payload during login', async () => {
    const user: AuthRepositoryUser = {
      id: 'user-1',
      name: 'Editor User',
      email,
      passwordHash: 'stored-hash',
      isActive: true,
      roleId: 'role-1',
      role: Role.EDITOR,
      team: null,
    };

    findUserByEmailSpy.mockResolvedValue(user);
    vi.mocked(argon2.verify).mockResolvedValue(true);

    await authService.login(email, password);

    expect(jwtSigner.signAsync).toHaveBeenCalledTimes(1);

    const firstCall = jwtSigner.signAsync.mock.calls[0];

    if (!firstCall) {
      throw new Error('Expected jwtSigner.signAsync to be called');
    }

    const [payload] = firstCall;

    expect(payload).toEqual({
      sub: 'user-1',
      email,
    });
  });

  it('should reject login when user not found', async () => {
    findUserByEmailSpy.mockResolvedValue(null);

    await expect(authService.login(email, password)).rejects.toThrow(
      'Invalid email or password',
    );
  });

  it('should reject login when user is inactive', async () => {
    const user: AuthRepositoryUser = {
      id: 'user-1',
      name: 'Editor User',
      email,
      passwordHash: 'stored-hash',
      isActive: false,
      roleId: 'role-1',
      role: Role.EDITOR,
      team: null,
    };

    findUserByEmailSpy.mockResolvedValue(user);

    await expect(authService.login(email, password)).rejects.toThrow(
      'Invalid email or password',
    );
  });

  it('should reject login when password is invalid', async () => {
    const user: AuthRepositoryUser = {
      id: 'user-1',
      name: 'Editor User',
      email,
      passwordHash: 'stored-hash',
      isActive: true,
      roleId: 'role-1',
      role: Role.EDITOR,
      team: null,
    };

    findUserByEmailSpy.mockResolvedValue(user);
    vi.mocked(argon2.verify).mockResolvedValue(false);

    await expect(authService.login(email, password)).rejects.toThrow(
      'Invalid email or password',
    );
  });

  it('should return authenticated user by id', async () => {
    const user: AuthRepositoryUser = {
      id: 'user-1',
      name: 'Editor User',
      email,
      passwordHash: 'stored-hash',
      isActive: true,
      roleId: 'role-1',
      role: Role.EDITOR,
      team: null,
    };

    findUserByIdSpy.mockResolvedValue(user);

    const result = await authService.getAuthenticatedUserById('user-1');

    expect(result).toEqual({
      id: 'user-1',
      name: 'Editor User',
      email,
      roleId: 'role-1',
      role: Role.EDITOR,
      team: null,
    });
  });

  it('should return null when user not found by id', async () => {
    findUserByIdSpy.mockResolvedValue(null);

    const result = await authService.getAuthenticatedUserById('user-1');

    expect(result).toBeNull();
  });

  it('should return null when user is inactive', async () => {
    const user: AuthRepositoryUser = {
      id: 'user-1',
      name: 'Editor User',
      email,
      passwordHash: 'stored-hash',
      isActive: false,
      roleId: 'role-1',
      role: Role.EDITOR,
      team: null,
    };

    findUserByIdSpy.mockResolvedValue(user);

    const result = await authService.getAuthenticatedUserById('user-1');

    expect(result).toBeNull();
  });
});
