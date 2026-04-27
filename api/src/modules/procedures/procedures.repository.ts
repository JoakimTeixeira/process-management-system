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
  process_id?: string;
  process_code?: string;
  process_title?: string;
  version_number?: number;
  lifecycle_state?: string;
  architecture_state?: string;
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
  processId?: string;
  processCode?: string;
  processTitle?: string;
  versionNumber?: number;
  lifecycleState?: string;
  architectureState?: string;
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

  async findAllForBackoffice(): Promise<ProcedureRecord[]> {
    const rows = await queryRows<ProcedureRow>(
      this.dataSource,
      `
        SELECT
          pr.id,
          pr.process_version_id,
          pv.process_id,
          p.code AS process_code,
          p.title AS process_title,
          pv.version_number,
          pv.lifecycle_state,
          pv.architecture_state,
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
        INNER JOIN process_versions pv ON pv.id = pr.process_version_id
        INNER JOIN processes p ON p.id = pv.process_id
        ORDER BY p.code ASC, pv.version_number DESC, pr.code ASC
      `,
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

  async getNextProcedureCode(processVersionId: string): Promise<string> {
    const rows = await queryRows<{
      process_code: string;
      max_suffix: number | null;
    }>(
      this.dataSource,
      `
        SELECT
          p.code AS process_code,
          MAX(
            CASE
              WHEN pr.code ~ ('^' || regexp_replace(p.code, '([.^$*+?()\\[\\]{}|\\\\])', '\\\\\\1', 'g') || '\\.[0-9]+$')
                THEN split_part(pr.code, '.', 2)::int
              ELSE NULL
            END
          ) AS max_suffix
        FROM process_versions pv
        INNER JOIN processes p ON p.id = pv.process_id
        LEFT JOIN procedures pr ON pr.process_version_id = pv.id
        WHERE pv.id = $1
        GROUP BY p.code
      `,
      [processVersionId],
    );

    const processCode = rows[0]?.process_code;

    if (!processCode) {
      throw new TypeError(
        `Expected process version "${processVersionId}" to resolve to a process code`,
      );
    }

    const nextSuffix = (rows[0]?.max_suffix ?? 0) + 1;
    return `${processCode}.${nextSuffix}`;
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
      processId: row.process_id,
      processCode: row.process_code,
      processTitle: row.process_title,
      versionNumber: row.version_number,
      lifecycleState: row.lifecycle_state,
      architectureState: row.architecture_state,
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
