import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface QueryRow {
  [key: string]: unknown;
}

interface GlossaryTermRow extends QueryRow {
  id: string;
  term: string;
  definition: string;
  category: string | null;
  is_preferred: boolean;
  created_by: string | null;
}

interface ItilPracticeRow extends QueryRow {
  id: string;
  code: string;
  name: string;
  description: string;
}

function isQueryRow(value: unknown): value is QueryRow {
  return typeof value === 'object' && value !== null;
}

function isQueryRowArray(value: unknown): value is QueryRow[] {
  return Array.isArray(value) && value.every((item) => isQueryRow(item));
}

function extractQueryRows(result: unknown): QueryRow[] {
  if (isQueryRowArray(result)) {
    return result;
  }

  if (
    Array.isArray(result) &&
    result.length > 0 &&
    isQueryRowArray(result[0])
  ) {
    return result[0];
  }

  return [];
}

async function queryRows<T extends QueryRow>(
  dataSource: DataSource,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  const result = await dataSource.query<unknown>(sql, [...parameters]);

  // TypeORM/Postgres can return either a flat row array or a tuple-like
  // [rows, rowCount] shape for mutation queries with RETURNING.
  return extractQueryRows(result) as T[];
}

async function queryRow<T extends QueryRow>(
  dataSource: DataSource,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T | null> {
  const rows = await queryRows<T>(dataSource, sql, parameters);
  return rows.length > 0 ? rows[0] : null;
}

export type GlossaryTermRecord = {
  id: string;
  term: string;
  definition: string;
  category: string | null;
  isPreferred: boolean;
  createdBy: string | null;
};

export type GlossaryPracticeRecord = {
  id: string;
  code: string;
  name: string;
  description: string;
};

export type CreateGlossaryTermInput = {
  term: string;
  definition: string;
  category: string | null;
  isPreferred: boolean;
  createdBy: string;
};

export type UpdateGlossaryTermInput = {
  term?: string;
  definition?: string;
  category?: string | null;
  isPreferred?: boolean;
};

@Injectable()
export class GlossaryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async listTerms(): Promise<GlossaryTermRecord[]> {
    const rows = await queryRows<GlossaryTermRow>(
      this.dataSource,
      `
        SELECT
          gt.id,
          gt.term,
          gt.definition,
          gt.category,
          gt.is_preferred,
          gt.created_by
        FROM glossary_terms gt
        ORDER BY gt.term ASC
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      term: row.term,
      definition: row.definition,
      category: row.category,
      isPreferred: row.is_preferred,
      createdBy: row.created_by,
    }));
  }

  async listPractices(): Promise<GlossaryPracticeRecord[]> {
    const rows = await queryRows<ItilPracticeRow>(
      this.dataSource,
      `
        SELECT
          ip.id,
          ip.code,
          ip.name,
          ip.description
        FROM itil_practices ip
        ORDER BY ip.name ASC
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
    }));
  }

  async findById(id: string): Promise<GlossaryTermRecord | null> {
    const row = await queryRow<GlossaryTermRow>(
      this.dataSource,
      `
        SELECT
          gt.id,
          gt.term,
          gt.definition,
          gt.category,
          gt.is_preferred,
          gt.created_by
        FROM glossary_terms gt
        WHERE gt.id = $1
      `,
      [id],
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      term: row.term,
      definition: row.definition,
      category: row.category,
      isPreferred: row.is_preferred,
      createdBy: row.created_by,
    };
  }

  async create(input: CreateGlossaryTermInput): Promise<GlossaryTermRecord> {
    const row = await queryRow<GlossaryTermRow>(
      this.dataSource,
      `
        INSERT INTO glossary_terms (term, definition, category, is_preferred, created_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, term, definition, category, is_preferred, created_by
      `,
      [
        input.term,
        input.definition,
        input.category,
        input.isPreferred,
        input.createdBy,
      ],
    );

    if (!row) {
      throw new Error('Failed to create glossary term');
    }

    return {
      id: row.id,
      term: row.term,
      definition: row.definition,
      category: row.category,
      isPreferred: row.is_preferred,
      createdBy: row.created_by,
    };
  }

  async update(
    id: string,
    input: UpdateGlossaryTermInput,
  ): Promise<GlossaryTermRecord> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.term !== undefined) {
      setClauses.push(`term = $${paramIndex++}`);
      values.push(input.term);
    }
    if (input.definition !== undefined) {
      setClauses.push(`definition = $${paramIndex++}`);
      values.push(input.definition);
    }
    if (input.category !== undefined) {
      setClauses.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.isPreferred !== undefined) {
      setClauses.push(`is_preferred = $${paramIndex++}`);
      values.push(input.isPreferred);
    }

    if (setClauses.length === 0) {
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error('Glossary term not found');
      }
      return existing;
    }

    values.push(id);

    const row = await queryRow<GlossaryTermRow>(
      this.dataSource,
      `
        UPDATE glossary_terms
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, term, definition, category, is_preferred, created_by
      `,
      values,
    );

    if (!row) {
      throw new Error('Glossary term not found');
    }

    return {
      id: row.id,
      term: row.term,
      definition: row.definition,
      category: row.category,
      isPreferred: row.is_preferred,
      createdBy: row.created_by,
    };
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.query(
      `
        DELETE FROM glossary_terms
        WHERE id = $1
      `,
      [id],
    );
  }
}
