import * as argon2 from 'argon2';

import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import authConfig from '../../config/auth.config';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthRepository, AuthRepositoryUser } from './auth.repository';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

interface JwtSigner {
  signAsync(payload: JwtPayload): Promise<string>;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private static readonly INVALID_CREDENTIALS_MESSAGE =
    'Invalid email or password';

  constructor(
    private readonly authRepository: AuthRepository,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    @Inject('JWT_SIGNER') private readonly jwtSigner: JwtSigner,
  ) {}

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user?.isActive || !user.passwordHash) {
      this.rejectLoginAttempt(email);
    }

    const passwordIsValid = await argon2.verify(user.passwordHash, password, {
      secret: Buffer.from(this.authConfiguration.passwordPepper, 'utf8'),
    });

    if (!passwordIsValid) {
      this.rejectLoginAttempt(email);
    }

    const issuedAt = new Date();
    const expiresAt = new Date(
      issuedAt.getTime() + this.authConfiguration.jwtExpiresInSeconds * 1000,
    );
    const accessToken = await this.jwtSigner.signAsync({
      sub: user.id,
      email: user.email,
    });

    this.logger.log(`Issued access token for user "${user.id}"`);

    return new LoginResponseDto({
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.authConfiguration.jwtExpiresInSeconds,
      expiresAt: expiresAt.toISOString(),
    });
  }

  async getAuthenticatedUserById(
    userId: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.authRepository.findUserById(userId);

    if (!user?.isActive) {
      return null;
    }

    return this.mapAuthenticatedUser(user);
  }

  private mapAuthenticatedUser(user: AuthRepositoryUser): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      role: user.role,
      team: user.team,
    };
  }

  private rejectLoginAttempt(email: string): never {
    this.logger.warn(`Rejected login attempt for email "${email}"`);
    throw new UnauthorizedException(AuthService.INVALID_CREDENTIALS_MESSAGE);
  }
}
