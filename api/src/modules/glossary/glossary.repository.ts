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
}

interface ItilPracticeRow extends QueryRow {
  id: string;
  code: string;
  name: string;
  description: string;
}

async function queryRows<T extends QueryRow>(
  dataSource: DataSource,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await dataSource.query(sql, [...parameters]);
}

export type GlossaryTermRecord = {
  id: string;
  term: string;
  definition: string;
  category: string | null;
  isPreferred: boolean;
};

export type GlossaryPracticeRecord = {
  id: string;
  code: string;
  name: string;
  description: string;
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
          gt.is_preferred
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
}
