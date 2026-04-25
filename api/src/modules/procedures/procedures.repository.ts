import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import type { SqlExecutor } from '../../common/types/sql-executor.type';

interface QueryRow {
  [key: string]: unknown;
}

interface ProcedureRow extends QueryRow {
  id: string;
  process_version_id: string;
  code: string;
  title: string;
  utility: string;
  warranty: string;
  outcome: string;
  policy: string;
  activities: Record<string, unknown>[];
  inputs: string[];
  outputs: string[];
}

export interface ProcedureRecord {
  id: string;
  processVersionId: string;
  code: string;
  title: string;
  utility: string;
  warranty: string;
  outcome: string;
  policy: string;
  activities: Record<string, unknown>[];
  inputs: string[];
  outputs: string[];
}

interface CreateProcedureInput {
  processVersionId: string;
  code: string;
  title: string;
  utility: string;
  warranty: string;
  outcome: string;
  policy: string;
  activities: Record<string, unknown>[];
  inputs: string[];
  outputs: string[];
  actorId: string;
}

interface UpdateProcedureInput {
  code?: string;
  title?: string;
  utility?: string;
  warranty?: string;
  outcome?: string;
  policy?: string;
  activities?: Record<string, unknown>[];
  inputs?: string[];
  outputs?: string[];
}

async function queryRows<T extends QueryRow>(
  executor: SqlExecutor,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await executor.query<T[]>(sql, [...parameters]);
}

@Injectable()
export class ProceduresRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findById(id: string): Promise<ProcedureRecord | null> {
    const rows = await queryRows<ProcedureRow>(
      this.dataSource,
      `
        SELECT
          pr.id,
          pr.process_version_id,
          pr.code,
          pr.title,
          pr.utility,
          pr.warranty,
          pr.outcome,
          pr.policy,
          pr.activities,
          pr.inputs,
          pr.outputs
        FROM procedures pr
        WHERE pr.id = $1
        LIMIT 1
      `,
      [id],
    );

    return rows[0] ? this.mapRecord(rows[0]) : null;
  }

  async findByProcessVersionId(
    processVersionId: string,
  ): Promise<ProcedureRecord[]> {
    const rows = await queryRows<ProcedureRow>(
      this.dataSource,
      `
        SELECT
          pr.id,
          pr.process_version_id,
          pr.code,
          pr.title,
          pr.utility,
          pr.warranty,
          pr.outcome,
          pr.policy,
          pr.activities,
          pr.inputs,
          pr.outputs
        FROM procedures pr
        WHERE pr.process_version_id = $1
        ORDER BY pr.code ASC
      `,
      [processVersionId],
    );

    return rows.map((row) => this.mapRecord(row));
  }

  async findByVersionAndCode(
    processVersionId: string,
    code: string,
  ): Promise<ProcedureRecord | null> {
    const rows = await queryRows<ProcedureRow>(
      this.dataSource,
      `
        SELECT
          pr.id,
          pr.process_version_id,
          pr.code,
          pr.title,
          pr.utility,
          pr.warranty,
          pr.outcome,
          pr.policy,
          pr.activities,
          pr.inputs,
          pr.outputs
        FROM procedures pr
        WHERE pr.process_version_id = $1
          AND pr.code = $2
        LIMIT 1
      `,
      [processVersionId, code],
    );

    return rows[0] ? this.mapRecord(rows[0]) : null;
  }

  async create(input: CreateProcedureInput): Promise<ProcedureRecord> {
    const rows = await queryRows<{ id: string }>(
      this.dataSource,
      `
        INSERT INTO procedures (
          process_version_id,
          code,
          title,
          utility,
          warranty,
          outcome,
          policy,
          activities,
          inputs,
          outputs,
          created_by,
          updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11, $11)
        RETURNING id
      `,
      [
        input.processVersionId,
        input.code,
        input.title,
        input.utility,
        input.warranty,
        input.outcome,
        input.policy,
        JSON.stringify(input.activities),
        JSON.stringify(input.inputs),
        JSON.stringify(input.outputs),
        input.actorId,
      ],
    );

    return this.findRequiredById(rows[0]?.id);
  }

  async update(
    id: string,
    input: UpdateProcedureInput,
    actorId: string,
  ): Promise<ProcedureRecord> {
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

    if (input.utility !== undefined) {
      parameters.push(input.utility);
      setClauses.push(`utility = $${parameters.length}`);
    }

    if (input.warranty !== undefined) {
      parameters.push(input.warranty);
      setClauses.push(`warranty = $${parameters.length}`);
    }

    if (input.outcome !== undefined) {
      parameters.push(input.outcome);
      setClauses.push(`outcome = $${parameters.length}`);
    }

    if (input.policy !== undefined) {
      parameters.push(input.policy);
      setClauses.push(`policy = $${parameters.length}`);
    }

    if (input.activities !== undefined) {
      parameters.push(JSON.stringify(input.activities));
      setClauses.push(`activities = $${parameters.length}::jsonb`);
    }

    if (input.inputs !== undefined) {
      parameters.push(JSON.stringify(input.inputs));
      setClauses.push(`inputs = $${parameters.length}::jsonb`);
    }

    if (input.outputs !== undefined) {
      parameters.push(JSON.stringify(input.outputs));
      setClauses.push(`outputs = $${parameters.length}::jsonb`);
    }

    parameters.push(actorId);
    setClauses.push(`updated_by = $${parameters.length}`);
    parameters.push(id);

    await this.dataSource.query(
      `
        UPDATE procedures
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
        DELETE FROM procedures
        WHERE id = $1
      `,
      [id],
    );
  }

  private async findRequiredById(
    id: string | undefined,
  ): Promise<ProcedureRecord> {
    if (!id) {
      throw new TypeError('Expected procedure identifier to be available');
    }

    const procedure = await this.findById(id);

    if (!procedure) {
      throw new TypeError(`Expected procedure "${id}" to exist`);
    }

    return procedure;
  }

  private mapRecord(row: ProcedureRow): ProcedureRecord {
    return {
      id: row.id,
      processVersionId: row.process_version_id,
      code: row.code,
      title: row.title,
      utility: row.utility,
      warranty: row.warranty,
      outcome: row.outcome,
      policy: row.policy,
      activities: row.activities ?? [],
      inputs: row.inputs ?? [],
      outputs: row.outputs ?? [],
    };
  }
}
