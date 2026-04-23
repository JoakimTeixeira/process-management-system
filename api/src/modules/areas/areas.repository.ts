import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface QueryRow {
  [key: string]: unknown;
}

interface AreaRow extends QueryRow {
  id: string;
  code: string;
  title: string;
  description: string | null;
  owner_id: string;
  itil_practice_id: string;
  practice_name: string;
}

interface ExistsRow extends QueryRow {
  exists: boolean;
}

export interface AreaRecord {
  id: string;
  code: string;
  title: string;
  description: string | null;
  ownerId: string;
  itilPracticeId: string;
  itilPracticeName: string;
}

interface CreateAreaInput {
  code: string;
  title: string;
  description: string | null;
  ownerId: string;
  itilPracticeId: string;
  actorId: string;
}

interface UpdateAreaInput {
  code?: string;
  title?: string;
  description?: string;
  ownerId?: string;
  itilPracticeId?: string;
}

async function queryRows<T extends QueryRow>(
  dataSource: DataSource,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await dataSource.query(sql, [...parameters]);
}

@Injectable()
export class AreasRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(): Promise<AreaRecord[]> {
    const rows = await queryRows<AreaRow>(
      this.dataSource,
      `
        SELECT
          a.id,
          a.code,
          a.title,
          a.description,
          a.owner_id,
          a.itil_practice_id,
          ip.name AS practice_name
        FROM areas a
        INNER JOIN itil_practices ip ON ip.id = a.itil_practice_id
        ORDER BY a.title ASC
      `,
    );

    return rows.map((row) => this.mapRecord(row));
  }

  async findById(id: string): Promise<AreaRecord | null> {
    const rows = await queryRows<AreaRow>(
      this.dataSource,
      `
        SELECT
          a.id,
          a.code,
          a.title,
          a.description,
          a.owner_id,
          a.itil_practice_id,
          ip.name AS practice_name
        FROM areas a
        INNER JOIN itil_practices ip ON ip.id = a.itil_practice_id
        WHERE a.id = $1
        LIMIT 1
      `,
      [id],
    );

    return this.mapFirstRecord(rows);
  }

  async findByCode(code: string): Promise<AreaRecord | null> {
    const rows = await queryRows<AreaRow>(
      this.dataSource,
      `
        SELECT
          a.id,
          a.code,
          a.title,
          a.description,
          a.owner_id,
          a.itil_practice_id,
          ip.name AS practice_name
        FROM areas a
        INNER JOIN itil_practices ip ON ip.id = a.itil_practice_id
        WHERE a.code = $1
        LIMIT 1
      `,
      [code],
    );

    return this.mapFirstRecord(rows);
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

  async create(input: CreateAreaInput): Promise<AreaRecord> {
    const rows = await queryRows<{ id: string }>(
      this.dataSource,
      `
        INSERT INTO areas (
          itil_practice_id,
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
        input.itilPracticeId,
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
    input: UpdateAreaInput,
    actorId: string,
  ): Promise<AreaRecord> {
    const setClauses: string[] = [];
    const parameters: unknown[] = [];

    if (input.code !== undefined) {
      parameters.push(input.code);
      setClauses.push(`code = $${parameters.length}`);
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

    if (input.itilPracticeId !== undefined) {
      parameters.push(input.itilPracticeId);
      setClauses.push(`itil_practice_id = $${parameters.length}`);
    }

    parameters.push(actorId);
    setClauses.push(`updated_by = $${parameters.length}`);
    parameters.push(id);

    await this.dataSource.query(
      `
        UPDATE areas
        SET ${setClauses.join(', ')}
        WHERE id = $${parameters.length}
      `,
      parameters,
    );

    return this.findRequiredById(id);
  }

  private async findRequiredById(id: string | undefined): Promise<AreaRecord> {
    if (!id) {
      throw new TypeError('Expected area identifier to be available');
    }

    const area = await this.findById(id);

    if (!area) {
      throw new TypeError(`Expected area "${id}" to exist`);
    }

    return area;
  }

  private mapFirstRecord(rows: AreaRow[]): AreaRecord | null {
    return rows.length > 0 ? this.mapRecord(rows[0]) : null;
  }

  private mapRecord(row: AreaRow): AreaRecord {
    return {
      id: row.id,
      code: row.code,
      title: row.title,
      description: row.description,
      ownerId: row.owner_id,
      itilPracticeId: row.itil_practice_id,
      itilPracticeName: row.practice_name,
    };
  }
}
