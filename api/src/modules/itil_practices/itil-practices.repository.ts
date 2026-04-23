import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface QueryRow {
  [key: string]: unknown;
}

interface ItilPracticeRow extends QueryRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface ItilPracticeRecord {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

interface CreateItilPracticeInput {
  code: string;
  name: string;
  description: string | null;
}

async function queryRows<T extends QueryRow>(
  dataSource: DataSource,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await dataSource.query(sql, [...parameters]);
}

@Injectable()
export class ItilPracticesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(): Promise<ItilPracticeRecord[]> {
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

    return rows.map((row) => this.mapRecord(row));
  }

  async findById(id: string): Promise<ItilPracticeRecord | null> {
    const rows = await queryRows<ItilPracticeRow>(
      this.dataSource,
      `
        SELECT
          ip.id,
          ip.code,
          ip.name,
          ip.description
        FROM itil_practices ip
        WHERE ip.id = $1
        LIMIT 1
      `,
      [id],
    );

    return this.mapFirstRecord(rows);
  }

  async findByCodeOrName(
    code: string,
    name: string,
  ): Promise<ItilPracticeRecord | null> {
    const rows = await queryRows<ItilPracticeRow>(
      this.dataSource,
      `
        SELECT
          ip.id,
          ip.code,
          ip.name,
          ip.description
        FROM itil_practices ip
        WHERE ip.code = $1 OR ip.name = $2
        LIMIT 1
      `,
      [code, name],
    );

    return this.mapFirstRecord(rows);
  }

  async create(input: CreateItilPracticeInput): Promise<ItilPracticeRecord> {
    const rows = await queryRows<ItilPracticeRow>(
      this.dataSource,
      `
        INSERT INTO itil_practices (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING
          id,
          code,
          name,
          description
      `,
      [input.code, input.name, input.description],
    );

    return this.mapRequiredRecord(rows);
  }

  private mapFirstRecord(rows: ItilPracticeRow[]): ItilPracticeRecord | null {
    return rows.length > 0 ? this.mapRecord(rows[0]) : null;
  }

  private mapRequiredRecord(rows: ItilPracticeRow[]): ItilPracticeRecord {
    const practice = this.mapFirstRecord(rows);

    if (!practice) {
      throw new TypeError('Expected ITIL practice query to return a record');
    }

    return practice;
  }

  private mapRecord(row: ItilPracticeRow): ItilPracticeRecord {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
    };
  }
}
