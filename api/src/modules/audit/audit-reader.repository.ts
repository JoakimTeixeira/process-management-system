import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import type { AuditAction } from './types/audit-action.type';

interface QueryRow {
  [key: string]: unknown;
}

interface AuditLogRow extends QueryRow {
  id: string;
  entity_type: string;
  entity_id: string;
  action: AuditAction;
  actor_id: string | null;
  actor_name: string | null;
  reason_for_change: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: Date;
}

interface VersionStateHistoryRow extends QueryRow {
  id: string;
  process_version_id: string;
  from_state: string | null;
  to_state: string;
  actor_id: string | null;
  actor_name: string | null;
  reason: string | null;
  created_at: Date;
}

interface AuditAccessRow extends QueryRow {
  entity_exists: boolean;
  owner_team_id: string | null;
}

export interface AuditLogRecord {
  id: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  actorId: string | null;
  actorName: string | null;
  reasonForChange: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  createdAt: Date;
}

export interface VersionStateHistoryRecord {
  id: string;
  processVersionId: string;
  fromState: string | null;
  toState: string;
  actorId: string | null;
  actorName: string | null;
  reason: string | null;
  createdAt: Date;
}

export interface WorkflowAuditAccessRecord {
  entityExists: boolean;
  ownerTeamId: string | null;
}

async function queryRows<T extends QueryRow>(
  dataSource: DataSource,
  sql: string,
  parameters: readonly unknown[],
): Promise<T[]> {
  return await dataSource.query<T[]>(sql, [...parameters]);
}

@Injectable()
export class AuditReaderRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findLogsByEntity(
    entityType: string,
    entityId: string,
  ): Promise<AuditLogRecord[]> {
    const rows = await queryRows<AuditLogRow>(
      this.dataSource,
      `
        SELECT
          al.id,
          al.entity_type,
          al.entity_id,
          al.action,
          al.actor_id,
          actor.name AS actor_name,
          al.reason_for_change,
          al.old_data,
          al.new_data,
          al.created_at
        FROM audit_logs al
        LEFT JOIN users actor ON actor.id = al.actor_id
        WHERE al.entity_type = $1
          AND al.entity_id = $2
        ORDER BY al.created_at ASC, al.id ASC
      `,
      [entityType, entityId],
    );

    return rows.map((row) => this.mapAuditLog(row));
  }

  async findVersionStateHistory(
    processVersionId: string,
  ): Promise<VersionStateHistoryRecord[]> {
    const rows = await queryRows<VersionStateHistoryRow>(
      this.dataSource,
      `
        SELECT
          vsh.id,
          vsh.process_version_id,
          vsh.from_state,
          vsh.to_state,
          vsh.actor_id,
          actor.name AS actor_name,
          vsh.reason,
          vsh.created_at
        FROM version_state_history vsh
        LEFT JOIN users actor ON actor.id = vsh.actor_id
        WHERE vsh.process_version_id = $1
        ORDER BY vsh.created_at ASC, vsh.id ASC
      `,
      [processVersionId],
    );

    return rows.map((row) => this.mapVersionStateHistory(row));
  }

  async findWorkflowAuditAccess(
    entityType: 'area' | 'process' | 'process_version' | 'procedure' | 'asset',
    entityId: string,
  ): Promise<WorkflowAuditAccessRecord> {
    const sqlByEntityType = {
      area: `
        SELECT
          TRUE AS entity_exists,
          owner.team_id AS owner_team_id
        FROM areas a
        INNER JOIN users owner ON owner.id = a.owner_id
        WHERE a.id = $1
        LIMIT 1
      `,
      process: `
        SELECT
          TRUE AS entity_exists,
          owner.team_id AS owner_team_id
        FROM processes p
        INNER JOIN users owner ON owner.id = p.owner_id
        WHERE p.id = $1
        LIMIT 1
      `,
      process_version: `
        SELECT
          TRUE AS entity_exists,
          owner.team_id AS owner_team_id
        FROM process_versions pv
        INNER JOIN processes p ON p.id = pv.process_id
        INNER JOIN users owner ON owner.id = p.owner_id
        WHERE pv.id = $1
        LIMIT 1
      `,
      procedure: `
        SELECT
          TRUE AS entity_exists,
          owner.team_id AS owner_team_id
        FROM procedures pr
        INNER JOIN process_versions pv ON pv.id = pr.process_version_id
        INNER JOIN processes p ON p.id = pv.process_id
        INNER JOIN users owner ON owner.id = p.owner_id
        WHERE pr.id = $1
        LIMIT 1
      `,
      asset: `
        SELECT
          TRUE AS entity_exists,
          owner.team_id AS owner_team_id
        FROM assets a
        INNER JOIN process_versions pv ON pv.id = a.process_version_id
        INNER JOIN processes p ON p.id = pv.process_id
        INNER JOIN users owner ON owner.id = p.owner_id
        WHERE a.id = $1
        LIMIT 1
      `,
    } as const;

    const rows = await queryRows<AuditAccessRow>(
      this.dataSource,
      sqlByEntityType[entityType],
      [entityId],
    );
    const row = rows[0];

    if (!row) {
      return {
        entityExists: false,
        ownerTeamId: null,
      };
    }

    return {
      entityExists: row.entity_exists,
      ownerTeamId: row.owner_team_id,
    };
  }

  private mapAuditLog(row: AuditLogRow): AuditLogRecord {
    return {
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      actorId: row.actor_id,
      actorName: row.actor_name,
      reasonForChange: row.reason_for_change,
      oldData: row.old_data,
      newData: row.new_data,
      createdAt: row.created_at,
    };
  }

  private mapVersionStateHistory(
    row: VersionStateHistoryRow,
  ): VersionStateHistoryRecord {
    return {
      id: row.id,
      processVersionId: row.process_version_id,
      fromState: row.from_state,
      toState: row.to_state,
      actorId: row.actor_id,
      actorName: row.actor_name,
      reason: row.reason,
      createdAt: row.created_at,
    };
  }
}
