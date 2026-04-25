import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import type { SqlExecutor } from '../../common/types/sql-executor.type';

interface QueryRow {
  [key: string]: unknown;
}

interface ExistsRow extends QueryRow {
  exists: boolean;
}

interface ProcessRow extends QueryRow {
  id: string;
  area_id: string;
  code: string;
  title: string;
  description: string | null;
  owner_id: string;
}

export interface ProcessRecord {
  id: string;
  areaId: string;
  code: string;
  title: string;
  description: string | null;
  ownerId: string;
}

interface CreateProcessInput {
  areaId: string;
  code: string;
  title: string;
  description: string;
  ownerId: string;
  actorId: string;
}

interface UpdateProcessInput {
  areaId?: string;
  title?: string;
  description?: string;
  ownerId?: string;
}

async function queryRows<T extends QueryRow>(
  executor: SqlExecutor,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await executor.query<T[]>(sql, [...parameters]);
}

@Injectable()
export class ProcessesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(): Promise<ProcessRecord[]> {
    const rows = await queryRows<ProcessRow>(
      this.dataSource,
      `
        SELECT
          p.id,
          p.area_id,
          p.code,
          p.title,
          p.description,
          p.owner_id
        FROM processes p
        ORDER BY p.code ASC
      `,
    );

    return rows.map((row) => this.mapRecord(row));
  }

  async findById(
    id: string,
    executor: SqlExecutor = this.dataSource,
  ): Promise<ProcessRecord | null> {
    const rows = await queryRows<ProcessRow>(
      executor,
      `
        SELECT
          p.id,
          p.area_id,
          p.code,
          p.title,
          p.description,
          p.owner_id
        FROM processes p
        WHERE p.id = $1
        LIMIT 1
      `,
      [id],
    );

    return rows[0] ? this.mapRecord(rows[0]) : null;
  }

  async findByCode(code: string): Promise<ProcessRecord | null> {
    const rows = await queryRows<ProcessRow>(
      this.dataSource,
      `
        SELECT
          p.id,
          p.area_id,
          p.code,
          p.title,
          p.description,
          p.owner_id
        FROM processes p
        WHERE p.code = $1
        LIMIT 1
      `,
      [code],
    );

    return rows[0] ? this.mapRecord(rows[0]) : null;
  }

  async areaExists(areaId: string): Promise<boolean> {
    const rows = await queryRows<ExistsRow>(
      this.dataSource,
      `
        SELECT EXISTS (
          SELECT 1
          FROM areas a
          WHERE a.id = $1
        ) AS exists
      `,
      [areaId],
    );

    return rows[0]?.exists ?? false;
  }

  async ownerExists(ownerId: string): Promise<boolean> {
    const rows = await queryRows<ExistsRow>(
      this.dataSource,
      `
        SELECT EXISTS (
          SELECT 1
          FROM users u
          WHERE u.id = $1
        ) AS exists
      `,
      [ownerId],
    );

    return rows[0]?.exists ?? false;
  }

  async create(input: CreateProcessInput): Promise<ProcessRecord> {
    const rows = await queryRows<{ id: string }>(
      this.dataSource,
      `
        INSERT INTO processes (
          area_id,
          code,
          title,
          description,
          owner_id,
          created_by,
          updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING id
      `,
      [
        input.areaId,
        input.code,
        input.title,
        input.description,
        input.ownerId,
        input.actorId,
      ],
    );

    return this.findRequiredById(rows[0]?.id);
  }

  async update(
    id: string,
    input: UpdateProcessInput,
    actorId: string,
  ): Promise<ProcessRecord> {
    const setClauses: string[] = [];
    const parameters: unknown[] = [];

    if (input.areaId !== undefined) {
      parameters.push(input.areaId);
      setClauses.push(`area_id = $${parameters.length}`);
    }

    if (input.title !== undefined) {
      parameters.push(input.title);
      setClauses.push(`title = $${parameters.length}`);
    }

    if (input.description !== undefined) {
      parameters.push(input.description);
      setClauses.push(`description = $${parameters.length}`);
    }

    if (input.ownerId !== undefined) {
      parameters.push(input.ownerId);
      setClauses.push(`owner_id = $${parameters.length}`);
    }

    parameters.push(actorId);
    setClauses.push(`updated_by = $${parameters.length}`);
    parameters.push(id);

    await this.dataSource.query(
      `
        UPDATE processes
        SET ${setClauses.join(', ')}
        WHERE id = $${parameters.length}
      `,
      parameters,
    );

    return this.findRequiredById(id);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.query(
      `
        DELETE FROM processes
        WHERE id = $1
      `,
      [id],
    );
  }

  private async findRequiredById(
    id: string | undefined,
  ): Promise<ProcessRecord> {
    if (!id) {
      throw new TypeError('Expected process identifier to be available');
    }

    const process = await this.findById(id);

    if (!process) {
      throw new TypeError(`Expected process "${id}" to exist`);
    }

    return process;
  }

  private mapRecord(row: ProcessRow): ProcessRecord {
    return {
      id: row.id,
      areaId: row.area_id,
      code: row.code,
      title: row.title,
      description: row.description,
      ownerId: row.owner_id,
    };
  }

  async getNextProcessCode(): Promise<string> {
    const rows = await queryRows<{ max_code: string | null }>(
      this.dataSource,
      `
        SELECT MAX(code) AS max_code
        FROM processes
      `,
    );

    const maxCode = rows[0]?.max_code;
    if (!maxCode) {
      return '1';
    }

    const nextNumber = Number.parseInt(maxCode, 10) + 1;
    return nextNumber.toString();
  }
}
