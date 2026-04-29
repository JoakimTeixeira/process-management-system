import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface QueryRow {
  [key: string]: unknown;
}

interface TeamRow extends QueryRow {
  id: string;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface TeamRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface CreateTeamInput {
  code: string;
  name: string;
  description: string;
}

interface UpdateTeamInput {
  code?: string;
  name?: string;
  description?: string;
}

async function queryRows<T extends QueryRow>(
  dataSource: DataSource,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await dataSource.query(sql, [...parameters]);
}

@Injectable()
export class TeamsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(): Promise<TeamRecord[]> {
    const rows = await queryRows<TeamRow>(
      this.dataSource,
      `
        SELECT
          t.id,
          t.code,
          t.name,
          t.description,
          t.is_active
        FROM teams t
        ORDER BY t.name ASC
      `,
    );

    return rows.map((row) => this.mapRecord(row));
  }

  async findById(id: string): Promise<TeamRecord | null> {
    const rows = await queryRows<TeamRow>(
      this.dataSource,
      `
        SELECT
          t.id,
          t.code,
          t.name,
          t.description,
          t.is_active
        FROM teams t
        WHERE t.id = $1
        LIMIT 1
      `,
      [id],
    );

    return rows[0] ? this.mapRecord(rows[0]) : null;
  }

  async create(input: CreateTeamInput): Promise<TeamRecord> {
    const rows = await queryRows<{ id: string }>(
      this.dataSource,
      `
        INSERT INTO teams (
          code,
          name,
          description,
          is_active
        )
        VALUES ($1, $2, $3, TRUE)
        RETURNING id
      `,
      [input.code, input.name, input.description],
    );

    return this.findRequiredById(rows[0]?.id);
  }

  async update(id: string, input: UpdateTeamInput): Promise<TeamRecord> {
    const setClauses: string[] = [];
    const parameters: unknown[] = [];

    if (input.code !== undefined) {
      parameters.push(input.code);
      setClauses.push(`code = $${parameters.length}`);
    }

    if (input.name !== undefined) {
      parameters.push(input.name);
      setClauses.push(`name = $${parameters.length}`);
    }

    if (input.description !== undefined) {
      parameters.push(input.description);
      setClauses.push(`description = $${parameters.length}`);
    }

    if (setClauses.length === 0) {
      return this.findRequiredById(id);
    }

    parameters.push(id);

    await this.dataSource.query(
      `
        UPDATE teams
        SET ${setClauses.join(', ')}
        WHERE id = $${parameters.length}
      `,
      parameters,
    );

    return this.findRequiredById(id);
  }

  async deactivate(id: string): Promise<TeamRecord> {
    await this.dataSource.query(
      `
        UPDATE teams
        SET is_active = FALSE
        WHERE id = $1
      `,
      [id],
    );

    return this.findRequiredById(id);
  }

  private async findRequiredById(id: string | undefined): Promise<TeamRecord> {
    if (!id) {
      throw new TypeError('Expected team identifier to be available');
    }

    const team = await this.findById(id);

    if (!team) {
      throw new TypeError(`Expected team "${id}" to exist`);
    }

    return team;
  }

  private mapRecord(row: TeamRow): TeamRecord {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      isActive: row.is_active,
    };
  }
}
