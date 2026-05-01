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
  team_id: string;
  team_name: string;
  owner_id: string;
  owner_name: string;
}

interface ProcessRowWithGovernance extends QueryRow {
  id: string;
  area_id: string;
  code: string;
  title: string;
  description: string | null;
  team_id: string;
  team_name: string;
  owner_id: string;
  owner_name: string;
  current_as_is_id: string | null;
  current_as_is_version: number | null;
  current_as_is_state: string | null;
  current_to_be_id: string | null;
  current_to_be_version: number | null;
  current_to_be_state: string | null;
  active_workflow_id: string | null;
  active_workflow_version: number | null;
  active_workflow_architecture: string | null;
  active_workflow_state: string | null;
  total_versions: number | null;
  archived_versions: number | null;
}

export interface GovernanceSummary {
  currentAsIsVersion: {
    id: string;
    versionNumber: number;
    lifecycleState: string;
  } | null;
  currentToBeVersion: {
    id: string;
    versionNumber: number;
    lifecycleState: string;
  } | null;
  activeWorkflowVersion: {
    id: string;
    versionNumber: number;
    architectureState: string;
    lifecycleState: string;
    waitingForRole?: string | null;
    nextAction?: string | null;
  } | null;
  versionCounts: {
    total: number;
    archived: number;
  };
}

export interface ProcessRecord {
  id: string;
  areaId: string;
  code: string;
  title: string;
  description: string | null;
  teamId: string;
  teamName: string;
  ownerId: string;
  ownerName: string;
  governanceSummary?: GovernanceSummary;
}

interface CreateProcessInput {
  areaId: string;
  code: string;
  title: string;
  description: string;
  teamId: string;
  ownerId: string;
  actorId: string;
}

interface UpdateProcessInput {
  areaId?: string;
  title?: string;
  description?: string;
  teamId?: string;
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
          p.team_id,
          t.name AS team_name,
          p.owner_id,
          owner.name AS owner_name
        FROM processes p
        INNER JOIN teams t ON t.id = p.team_id
        INNER JOIN users owner ON owner.id = p.owner_id
        ORDER BY p.code ASC
      `,
    );

    return rows.map((row) => this.mapRecord(row));
  }

  async findAllWithGovernanceSummary(): Promise<ProcessRecord[]> {
    const rows = await queryRows<ProcessRowWithGovernance>(
      this.dataSource,
      `
        WITH version_summary AS (
          SELECT
            pv.process_id,
            pv.id AS version_id,
            pv.version_number,
            pv.lifecycle_state,
            pv.architecture_state,
            ROW_NUMBER() OVER (
              PARTITION BY pv.process_id, pv.architecture_state
              ORDER BY 
                CASE pv.lifecycle_state
                  WHEN 'Published' THEN 1
                  ELSE 2
                END,
                pv.version_number DESC
            ) AS rn_published,
            ROW_NUMBER() OVER (
              PARTITION BY pv.process_id
              ORDER BY 
                CASE pv.lifecycle_state
                  WHEN 'Approved' THEN 1
                  WHEN 'In Review' THEN 2
                  WHEN 'Draft' THEN 3
                  ELSE 4
                END,
                pv.version_number DESC
            ) AS rn_active
          FROM process_versions pv
          WHERE pv.lifecycle_state IN ('Draft', 'In Review', 'Approved', 'Published')
        ),
        version_counts AS (
          SELECT
            process_id,
            COUNT(*) AS total_versions,
            COUNT(*) FILTER (WHERE lifecycle_state = 'Archived') AS archived_versions
          FROM process_versions
          GROUP BY process_id
        ),
        current_versions AS (
          SELECT
            process_id,
            MAX(CASE WHEN architecture_state = 'AS-IS' AND lifecycle_state = 'Published' AND rn_published = 1 THEN version_number END) AS current_as_is_version,
            MAX(CASE WHEN architecture_state = 'AS-IS' AND lifecycle_state = 'Published' AND rn_published = 1 THEN lifecycle_state END) AS current_as_is_state,
            MAX(CASE WHEN architecture_state = 'TO-BE' AND lifecycle_state = 'Published' AND rn_published = 1 THEN version_number END) AS current_to_be_version,
            MAX(CASE WHEN architecture_state = 'TO-BE' AND lifecycle_state = 'Published' AND rn_published = 1 THEN lifecycle_state END) AS current_to_be_state,
            MAX(CASE WHEN lifecycle_state IN ('Draft', 'In Review', 'Approved') AND rn_active = 1 THEN version_number END) AS active_workflow_version,
            MAX(CASE WHEN lifecycle_state IN ('Draft', 'In Review', 'Approved') AND rn_active = 1 THEN architecture_state END) AS active_workflow_architecture,
            MAX(CASE WHEN lifecycle_state IN ('Draft', 'In Review', 'Approved') AND rn_active = 1 THEN lifecycle_state END) AS active_workflow_state
          FROM version_summary
          GROUP BY process_id
        ),
        version_ids AS (
          SELECT DISTINCT ON (process_id, architecture_state)
            process_id,
            architecture_state,
            version_id AS current_as_is_id
          FROM version_summary
          WHERE architecture_state = 'AS-IS' AND lifecycle_state = 'Published' AND rn_published = 1
          ORDER BY process_id, architecture_state, version_number DESC
        ),
        version_ids_to_be AS (
          SELECT DISTINCT ON (process_id, architecture_state)
            process_id,
            architecture_state,
            version_id AS current_to_be_id
          FROM version_summary
          WHERE architecture_state = 'TO-BE' AND lifecycle_state = 'Published' AND rn_published = 1
          ORDER BY process_id, architecture_state, version_number DESC
        ),
        version_ids_active AS (
          SELECT DISTINCT ON (process_id)
            process_id,
            version_id AS active_workflow_id
          FROM version_summary
          WHERE lifecycle_state IN ('Draft', 'In Review', 'Approved') AND rn_active = 1
          ORDER BY process_id, version_number DESC
        )
        SELECT
          p.id,
          p.area_id,
          p.code,
          p.title,
          p.description,
          p.team_id,
          t.name AS team_name,
          p.owner_id,
          owner.name AS owner_name,
          vi.current_as_is_id,
          cv.current_as_is_version,
          cv.current_as_is_state,
          vi_to_be.current_to_be_id,
          cv.current_to_be_version,
          cv.current_to_be_state,
          vi_active.active_workflow_id,
          cv.active_workflow_version,
          cv.active_workflow_architecture,
          cv.active_workflow_state,
          vc.total_versions,
          vc.archived_versions
        FROM processes p
        INNER JOIN teams t ON t.id = p.team_id
        INNER JOIN users owner ON owner.id = p.owner_id
        LEFT JOIN current_versions cv ON cv.process_id = p.id
        LEFT JOIN version_ids vi ON vi.process_id = p.id
        LEFT JOIN version_ids_to_be vi_to_be ON vi_to_be.process_id = p.id
        LEFT JOIN version_ids_active vi_active ON vi_active.process_id = p.id
        LEFT JOIN version_counts vc ON vc.process_id = p.id
        ORDER BY p.code ASC
      `,
    );

    return rows.map((row) => this.mapRecordWithGovernance(row));
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
          p.team_id,
          t.name AS team_name,
          p.owner_id,
          owner.name AS owner_name
        FROM processes p
        INNER JOIN teams t ON t.id = p.team_id
        INNER JOIN users owner ON owner.id = p.owner_id
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
          p.team_id,
          t.name AS team_name,
          p.owner_id,
          owner.name AS owner_name
        FROM processes p
        INNER JOIN teams t ON t.id = p.team_id
        INNER JOIN users owner ON owner.id = p.owner_id
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
            AND u.is_active = TRUE
        ) AS exists
      `,
      [ownerId],
    );

    return rows[0]?.exists ?? false;
  }

  async teamExists(teamId: string): Promise<boolean> {
    const rows = await queryRows<ExistsRow>(
      this.dataSource,
      `
        SELECT EXISTS (
          SELECT 1
          FROM teams t
          WHERE t.id = $1
            AND t.is_active = TRUE
        ) AS exists
      `,
      [teamId],
    );

    return rows[0]?.exists ?? false;
  }

  async userBelongsToTeam(userId: string, teamId: string): Promise<boolean> {
    const rows = await queryRows<ExistsRow>(
      this.dataSource,
      `
        SELECT EXISTS (
          SELECT 1
          FROM users u
          WHERE u.id = $1
            AND u.team_id = $2
            AND u.is_active = TRUE
        ) AS exists
      `,
      [userId, teamId],
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
          team_id,
          owner_id,
          created_by,
          updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
        RETURNING id
      `,
      [
        input.areaId,
        input.code,
        input.title,
        input.description,
        input.teamId,
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

    if (input.teamId !== undefined) {
      parameters.push(input.teamId);
      setClauses.push(`team_id = $${parameters.length}`);
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

  async hasAnyVersions(processId: string): Promise<boolean> {
    const rows = await queryRows<ExistsRow>(
      this.dataSource,
      `
        SELECT EXISTS (
          SELECT 1
          FROM process_versions pv
          WHERE pv.process_id = $1
        ) AS exists
      `,
      [processId],
    );

    return rows[0]?.exists ?? false;
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
      teamId: row.team_id,
      teamName: row.team_name,
      ownerId: row.owner_id,
      ownerName: row.owner_name,
    };
  }

  private mapRecordWithGovernance(
    row: ProcessRowWithGovernance,
  ): ProcessRecord {
    const governanceSummary: GovernanceSummary = {
      currentAsIsVersion: row.current_as_is_id
        ? {
            id: row.current_as_is_id,
            versionNumber: row.current_as_is_version!,
            lifecycleState: row.current_as_is_state!,
          }
        : null,
      currentToBeVersion: row.current_to_be_id
        ? {
            id: row.current_to_be_id,
            versionNumber: row.current_to_be_version!,
            lifecycleState: row.current_to_be_state!,
          }
        : null,
      activeWorkflowVersion: row.active_workflow_id
        ? {
            id: row.active_workflow_id,
            versionNumber: row.active_workflow_version!,
            architectureState: row.active_workflow_architecture!,
            lifecycleState: row.active_workflow_state!,
          }
        : null,
      versionCounts: {
        total: row.total_versions ?? 0,
        archived: row.archived_versions ?? 0,
      },
    };

    return {
      id: row.id,
      areaId: row.area_id,
      code: row.code,
      title: row.title,
      description: row.description,
      teamId: row.team_id,
      teamName: row.team_name,
      ownerId: row.owner_id,
      ownerName: row.owner_name,
      governanceSummary,
    };
  }

  async getNextProcessCode(): Promise<string> {
    const rows = await queryRows<{ max_code_number: number | null }>(
      this.dataSource,
      `
        SELECT MAX(code::integer) AS max_code_number
        FROM processes
      `,
    );

    const maxCodeNumber = rows[0]?.max_code_number;
    if (!maxCodeNumber) {
      return '1';
    }

    const nextNumber = maxCodeNumber + 1;
    return nextNumber.toString();
  }
}
