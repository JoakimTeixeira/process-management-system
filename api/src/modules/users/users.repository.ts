import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { parseRole, Role } from '../../common/enums/role.enum';

interface QueryRow {
  [key: string]: unknown;
}

interface UserAdminRow extends QueryRow {
  user_id: string;
  user_name: string;
  user_email: string;
  is_active: boolean;
  role_id: string;
  role_name: string;
  team_id: string;
  team_code: string;
  team_name: string;
}

interface OwnerOptionRow extends QueryRow {
  id: string;
  name: string;
  team_id: string;
}

interface TeamOptionRow extends QueryRow {
  id: string;
  code: string;
  name: string;
}

interface RoleRow extends QueryRow {
  id: string;
  name: string;
}

interface ExistsRow extends QueryRow {
  exists: boolean;
}

export interface UserAdminRecord {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: {
    id: string;
    name: Role;
  };
  team: {
    id: string;
    code: string;
    name: string;
  };
}

export interface OwnerOptionRecord {
  id: string;
  name: string;
  teamId: string;
}

export interface TeamOptionRecord {
  id: string;
  code: string;
  name: string;
}

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  roleId: string;
  teamId: string;
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  roleId?: string;
  teamId?: string;
  isActive?: boolean;
}

async function queryRows<T extends QueryRow>(
  dataSource: DataSource,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await dataSource.query(sql, [...parameters]);
}

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findOwnerOptionsByTeamId(teamId: string): Promise<OwnerOptionRecord[]> {
    const rows = await queryRows<OwnerOptionRow>(
      this.dataSource,
      `
        SELECT
          u.id,
          u.name,
          u.team_id
        FROM users u
        WHERE u.team_id = $1
          AND u.is_active = TRUE
        ORDER BY u.name ASC
      `,
      [teamId],
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      teamId: row.team_id,
    }));
  }

  async findAllOwnerOptions(): Promise<OwnerOptionRecord[]> {
    const rows = await queryRows<OwnerOptionRow>(
      this.dataSource,
      `
        SELECT
          u.id,
          u.name,
          u.team_id
        FROM users u
        WHERE u.is_active = TRUE
        ORDER BY u.name ASC
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      teamId: row.team_id,
    }));
  }

  async findTeamOptions(): Promise<TeamOptionRecord[]> {
    const rows = await queryRows<TeamOptionRow>(
      this.dataSource,
      `
        SELECT
          t.id,
          t.code,
          t.name
        FROM teams t
        ORDER BY t.name ASC
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
    }));
  }

  async findAll(): Promise<UserAdminRecord[]> {
    const rows = await queryRows<UserAdminRow>(
      this.dataSource,
      `
        SELECT
          u.id AS user_id,
          u.name AS user_name,
          u.email AS user_email,
          u.is_active,
          r.id AS role_id,
          r.name AS role_name,
          t.id AS team_id,
          t.code AS team_code,
          t.name AS team_name
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        INNER JOIN teams t ON t.id = u.team_id
        ORDER BY u.name ASC
      `,
    );

    return rows.map((row) => this.mapUserRecord(row));
  }

  async findById(id: string): Promise<UserAdminRecord | null> {
    const rows = await queryRows<UserAdminRow>(
      this.dataSource,
      `
        SELECT
          u.id AS user_id,
          u.name AS user_name,
          u.email AS user_email,
          u.is_active,
          r.id AS role_id,
          r.name AS role_name,
          t.id AS team_id,
          t.code AS team_code,
          t.name AS team_name
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        INNER JOIN teams t ON t.id = u.team_id
        WHERE u.id = $1
        LIMIT 1
      `,
      [id],
    );

    return rows[0] ? this.mapUserRecord(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<UserAdminRecord | null> {
    const rows = await queryRows<UserAdminRow>(
      this.dataSource,
      `
        SELECT
          u.id AS user_id,
          u.name AS user_name,
          u.email AS user_email,
          u.is_active,
          r.id AS role_id,
          r.name AS role_name,
          t.id AS team_id,
          t.code AS team_code,
          t.name AS team_name
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        INNER JOIN teams t ON t.id = u.team_id
        WHERE lower(u.email) = lower($1)
        LIMIT 1
      `,
      [email],
    );

    return rows[0] ? this.mapUserRecord(rows[0]) : null;
  }

  async findRoleById(
    roleId: string,
  ): Promise<{ id: string; name: Role } | null> {
    const rows = await queryRows<RoleRow>(
      this.dataSource,
      `
        SELECT r.id, r.name
        FROM roles r
        WHERE r.id = $1
        LIMIT 1
      `,
      [roleId],
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      id: rows[0].id,
      name: parseRole(rows[0].name),
    };
  }

  async findRoleByName(
    roleName: Role,
  ): Promise<{ id: string; name: Role } | null> {
    const rows = await queryRows<RoleRow>(
      this.dataSource,
      `
        SELECT r.id, r.name
        FROM roles r
        WHERE r.name = $1
        LIMIT 1
      `,
      [roleName],
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      id: rows[0].id,
      name: parseRole(rows[0].name),
    };
  }

  async teamExists(teamId: string): Promise<boolean> {
    const rows = await queryRows<ExistsRow>(
      this.dataSource,
      `
        SELECT EXISTS (
          SELECT 1
          FROM teams t
          WHERE t.id = $1
        ) AS exists
      `,
      [teamId],
    );

    return rows[0]?.exists ?? false;
  }

  async create(input: CreateUserInput): Promise<UserAdminRecord> {
    const rows = await queryRows<{ id: string }>(
      this.dataSource,
      `
        INSERT INTO users (
          role_id,
          team_id,
          name,
          email,
          password_hash,
          is_active
        )
        VALUES ($1, $2, $3, $4, $5, TRUE)
        RETURNING id
      `,
      [input.roleId, input.teamId, input.name, input.email, input.passwordHash],
    );

    return this.findRequiredById(rows[0]?.id);
  }

  async update(id: string, input: UpdateUserInput): Promise<UserAdminRecord> {
    const setClauses: string[] = [];
    const parameters: unknown[] = [];

    if (input.name !== undefined) {
      parameters.push(input.name);
      setClauses.push(`name = $${parameters.length}`);
    }

    if (input.email !== undefined) {
      parameters.push(input.email);
      setClauses.push(`email = $${parameters.length}`);
    }

    if (input.roleId !== undefined) {
      parameters.push(input.roleId);
      setClauses.push(`role_id = $${parameters.length}`);
    }

    if (input.teamId !== undefined) {
      parameters.push(input.teamId);
      setClauses.push(`team_id = $${parameters.length}`);
    }

    if (input.isActive !== undefined) {
      parameters.push(input.isActive);
      setClauses.push(`is_active = $${parameters.length}`);
    }

    if (setClauses.length === 0) {
      return this.findRequiredById(id);
    }

    parameters.push(id);

    await this.dataSource.query(
      `
        UPDATE users
        SET ${setClauses.join(', ')}
        WHERE id = $${parameters.length}
      `,
      parameters,
    );

    return this.findRequiredById(id);
  }

  async updatePasswordHash(
    id: string,
    passwordHash: string,
  ): Promise<UserAdminRecord> {
    await this.dataSource.query(
      `
        UPDATE users
        SET password_hash = $2
        WHERE id = $1
      `,
      [id, passwordHash],
    );

    return this.findRequiredById(id);
  }

  private async findRequiredById(
    id: string | undefined,
  ): Promise<UserAdminRecord> {
    if (!id) {
      throw new TypeError('Expected user identifier to be available');
    }

    const user = await this.findById(id);

    if (!user) {
      throw new TypeError(`Expected user "${id}" to exist`);
    }

    return user;
  }

  private mapUserRecord(row: UserAdminRow): UserAdminRecord {
    return {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
      isActive: row.is_active,
      role: {
        id: row.role_id,
        name: parseRole(row.role_name),
      },
      team: {
        id: row.team_id,
        code: row.team_code,
        name: row.team_name,
      },
    };
  }
}
