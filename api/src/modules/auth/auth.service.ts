import * as argon2 from 'argon2';

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import authConfig from '../../config/auth.config';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginResponse } from './interfaces/login-response.interface';

interface QueryRow {
  [key: string]: unknown;
}

interface UserAuthRow extends QueryRow {
  user_id: string;
  user_name: string;
  user_email: string;
  password_hash: string | null;
  is_active: boolean;
  role_id: string;
  role_name: string;
  team_id: string | null;
  team_code: string | null;
  team_name: string | null;
}

interface JwtSigner {
  signAsync(payload: JwtPayload): Promise<string>;
}

interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  isActive: boolean;
  roleId: string;
  roleName: string;
  team: AuthenticatedUser['team'];
}

async function queryRows<T extends QueryRow>(
  dataSource: DataSource,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await dataSource.query(sql, [...parameters]);
}

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    @Inject('JWT_SIGNER') private readonly jwtSigner: JwtSigner,
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const normalizedEmail = email.trim();
    const user = await this.findUserByEmail(normalizedEmail);

    if (!user || !user.isActive || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordIsValid = await argon2.verify(user.passwordHash, password, {
      secret: Buffer.from(this.authConfiguration.passwordPepper, 'utf8'),
    });

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const issuedAt = new Date();
    const expiresAt = new Date(
      issuedAt.getTime() + this.authConfiguration.jwtExpiresInSeconds * 1000,
    );
    const accessToken = await this.jwtSigner.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.authConfiguration.jwtExpiresInSeconds,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async getAuthenticatedUserById(
    userId: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.findUserById(userId);

    if (!user || !user.isActive) {
      return null;
    }

    return this.mapAuthenticatedUser(user);
  }

  private async findUserByEmail(email: string): Promise<DatabaseUser | null> {
    const rows = await queryRows<UserAuthRow>(
      this.dataSource,
      `
        SELECT
          u.id AS user_id,
          u.name AS user_name,
          u.email AS user_email,
          u.password_hash,
          u.is_active,
          r.id AS role_id,
          r.name AS role_name,
          t.id AS team_id,
          t.code AS team_code,
          t.name AS team_name
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        LEFT JOIN teams t ON t.id = u.team_id
        WHERE lower(u.email) = lower($1)
        LIMIT 1
      `,
      [email],
    );

    return this.mapDatabaseUser(rows);
  }

  private async findUserById(userId: string): Promise<DatabaseUser | null> {
    const rows = await queryRows<UserAuthRow>(
      this.dataSource,
      `
        SELECT
          u.id AS user_id,
          u.name AS user_name,
          u.email AS user_email,
          u.password_hash,
          u.is_active,
          r.id AS role_id,
          r.name AS role_name,
          t.id AS team_id,
          t.code AS team_code,
          t.name AS team_name
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        LEFT JOIN teams t ON t.id = u.team_id
        WHERE u.id = $1
        LIMIT 1
      `,
      [userId],
    );

    return this.mapDatabaseUser(rows);
  }

  private mapDatabaseUser(rows: UserAuthRow[]): DatabaseUser | null {
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    return {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
      passwordHash: row.password_hash,
      isActive: row.is_active,
      roleId: row.role_id,
      roleName: row.role_name,
      team:
        row.team_id && row.team_code && row.team_name
          ? {
              id: row.team_id,
              code: row.team_code,
              name: row.team_name,
            }
          : null,
    };
  }

  private mapAuthenticatedUser(user: DatabaseUser): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      team: user.team,
    };
  }
}
