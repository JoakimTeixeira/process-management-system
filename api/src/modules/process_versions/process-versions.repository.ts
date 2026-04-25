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

interface ProcessVersionRow extends QueryRow {
  id: string;
  process_id: string;
  version_number: number;
  lifecycle_state: string;
  architecture_state: string;
  title: string;
  checklist_completed: boolean;
  derived_from_version_id: string | null;
  change_description: string;
  reason_for_change: string;
}

export interface ProcessVersionRecord {
  id: string;
  processId: string;
  versionNumber: number;
  lifecycleState: string;
  architectureState: string;
  title: string;
  checklistCompleted: boolean;
  derivedFromVersionId: string | null;
  changeDescription: string;
  reasonForChange: string;
}

export interface CreateProcessVersionInput {
  processId: string;
  versionNumber: number;
  lifecycleState: string;
  architectureState: string;
  title: string;
  checklistCompleted: boolean;
  derivedFromVersionId: string | null;
  changeDescription: string;
  reasonForChange: string;
  createdBy: string;
  updatedBy: string;
}

interface UpdateProcessVersionInput {
  architectureState?: string;
  title?: string;
  checklistCompleted?: boolean;
  derivedFromVersionId?: string | null;
  changeDescription?: string;
  reasonForChange?: string;
}

async function queryRows<T extends QueryRow>(
  executor: SqlExecutor,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await executor.query<T[]>(sql, [...parameters]);
}

@Injectable()
export class ProcessVersionsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async processExists(processId: string): Promise<boolean> {
    const rows = await queryRows<ExistsRow>(
      this.dataSource,
      `
        SELECT EXISTS (
          SELECT 1
          FROM processes p
          WHERE p.id = $1
        ) AS exists
      `,
      [processId],
    );

    return rows[0]?.exists ?? false;
  }

  async findById(
    id: string,
    executor: SqlExecutor = this.dataSource,
    forUpdate = false,
  ): Promise<ProcessVersionRecord | null> {
    const rows = await queryRows<ProcessVersionRow>(
      executor,
      `
        SELECT
          pv.id,
          pv.process_id,
          pv.version_number,
          pv.lifecycle_state,
          pv.architecture_state,
          pv.title,
          pv.checklist_completed,
          pv.derived_from_version_id,
          pv.change_description,
          pv.reason_for_change
        FROM process_versions pv
        WHERE pv.id = $1
        LIMIT 1
        ${forUpdate ? 'FOR UPDATE' : ''}
      `,
      [id],
    );

    return rows[0] ? this.mapRecord(rows[0]) : null;
  }

  async findByProcessId(processId: string): Promise<ProcessVersionRecord[]> {
    const rows = await queryRows<ProcessVersionRow>(
      this.dataSource,
      `
        SELECT
          pv.id,
          pv.process_id,
          pv.version_number,
          pv.lifecycle_state,
          pv.architecture_state,
          pv.title,
          pv.checklist_completed,
          pv.derived_from_version_id,
          pv.change_description,
          pv.reason_for_change
        FROM process_versions pv
        WHERE pv.process_id = $1
        ORDER BY pv.version_number ASC
      `,
      [processId],
    );

    return rows.map((row) => this.mapRecord(row));
  }

  async findByProcessAndVersionNumber(
    processId: string,
    versionNumber: number,
    executor: SqlExecutor = this.dataSource,
  ): Promise<ProcessVersionRecord | null> {
    const rows = await queryRows<ProcessVersionRow>(
      executor,
      `
        SELECT
          pv.id,
          pv.process_id,
          pv.version_number,
          pv.lifecycle_state,
          pv.architecture_state,
          pv.title,
          pv.checklist_completed,
          pv.derived_from_version_id,
          pv.change_description,
          pv.reason_for_change
        FROM process_versions pv
        WHERE pv.process_id = $1
          AND pv.version_number = $2
        LIMIT 1
      `,
      [processId, versionNumber],
    );

    return rows[0] ? this.mapRecord(rows[0]) : null;
  }

  async create(
    input: CreateProcessVersionInput,
    executor: SqlExecutor = this.dataSource,
  ): Promise<ProcessVersionRecord> {
    const rows = await queryRows<{ id: string }>(
      executor,
      `
        INSERT INTO process_versions (
          process_id,
          version_number,
          lifecycle_state,
          architecture_state,
          title,
          checklist_completed,
          derived_from_version_id,
          change_description,
          reason_for_change,
          created_by,
          updated_by
        )
        VALUES (
          $1,
          $2,
          $3::process_lifecycle_state,
          $4::process_architecture_state,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14
        )
        RETURNING id
      `,
      [
        input.processId,
        input.versionNumber,
        input.lifecycleState,
        input.architectureState,
        input.title,
        input.checklistCompleted,
        input.derivedFromVersionId,
        input.changeDescription,
        input.reasonForChange,
        input.createdBy,
        input.updatedBy,
      ],
    );

    return this.findRequiredById(rows[0]?.id, executor);
  }

  async update(
    id: string,
    input: UpdateProcessVersionInput,
    actorId: string,
    executor: SqlExecutor = this.dataSource,
  ): Promise<ProcessVersionRecord> {
    const setClauses: string[] = [];
    const parameters: unknown[] = [];

    if (input.architectureState !== undefined) {
      parameters.push(input.architectureState);
      setClauses.push(
        `architecture_state = $${parameters.length}::process_architecture_state`,
      );
    }

    if (input.title !== undefined) {
      parameters.push(input.title);
      setClauses.push(`title = $${parameters.length}`);
    }

    if (input.checklistCompleted !== undefined) {
      parameters.push(input.checklistCompleted);
      setClauses.push(`checklist_completed = $${parameters.length}`);
    }

    if (input.derivedFromVersionId !== undefined) {
      parameters.push(input.derivedFromVersionId);
      setClauses.push(`derived_from_version_id = $${parameters.length}`);
    }

    if (input.changeDescription !== undefined) {
      parameters.push(input.changeDescription);
      setClauses.push(`change_description = $${parameters.length}`);
    }

    if (input.reasonForChange !== undefined) {
      parameters.push(input.reasonForChange);
      setClauses.push(`reason_for_change = $${parameters.length}`);
    }

    parameters.push(actorId);
    setClauses.push(`updated_by = $${parameters.length}`);
    parameters.push(id);

    await executor.query(
      `
        UPDATE process_versions
        SET ${setClauses.join(', ')}
        WHERE id = $${parameters.length}
      `,
      parameters,
    );

    return this.findRequiredById(id, executor);
  }

  async delete(
    id: string,
    executor: SqlExecutor = this.dataSource,
  ): Promise<void> {
    await executor.query(
      `
        DELETE FROM process_versions
        WHERE id = $1
      `,
      [id],
    );
  }

  async insertStateHistory(
    params: {
      processVersionId: string;
      fromState: string | null;
      toState: string;
      actorId: string;
      reason: string | null;
    },
    executor: SqlExecutor = this.dataSource,
  ): Promise<void> {
    await executor.query(
      `
        INSERT INTO version_state_history (
          process_version_id,
          from_state,
          to_state,
          actor_id,
          reason
        )
        VALUES ($1, $2::process_lifecycle_state, $3::process_lifecycle_state, $4, $5)
      `,
      [
        params.processVersionId,
        params.fromState,
        params.toState,
        params.actorId,
        params.reason,
      ],
    );
  }

  private async findRequiredById(
    id: string | undefined,
    executor: SqlExecutor,
  ): Promise<ProcessVersionRecord> {
    if (!id) {
      throw new TypeError(
        'Expected process version identifier to be available',
      );
    }

    const version = await this.findById(id, executor);

    if (!version) {
      throw new TypeError(`Expected process version "${id}" to exist`);
    }

    return version;
  }

  private mapRecord(row: ProcessVersionRow): ProcessVersionRecord {
    return {
      id: row.id,
      processId: row.process_id,
      versionNumber: row.version_number,
      lifecycleState: row.lifecycle_state,
      architectureState: row.architecture_state,
      title: row.title,
      checklistCompleted: row.checklist_completed,
      derivedFromVersionId: row.derived_from_version_id,
      changeDescription: row.change_description,
      reasonForChange: row.reason_for_change,
    };
  }
}
