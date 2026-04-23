import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { parseRole, Role } from '../../common/enums/role.enum';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

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

export interface AuthRepositoryUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  isActive: boolean;
  roleId: string;
  role: Role;
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
export class AuthRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findUserByEmail(email: string): Promise<AuthRepositoryUser | null> {
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

  async findUserById(userId: string): Promise<AuthRepositoryUser | null> {
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

  private mapDatabaseUser(rows: UserAuthRow[]): AuthRepositoryUser | null {
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
      role: parseRole(row.role_name),
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
}
