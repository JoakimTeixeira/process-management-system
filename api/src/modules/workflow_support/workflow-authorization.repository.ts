import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import type { SqlExecutor } from '../../common/types/sql-executor.type';

interface QueryRow {
  [key: string]: unknown;
}

interface TeamRow extends QueryRow {
  team_id: string | null;
}

async function queryRows<T extends QueryRow>(
  executor: SqlExecutor,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await executor.query<T[]>(sql, [...parameters]);
}

@Injectable()
export class WorkflowAuthorizationRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findUserTeamId(
    userId: string,
    executor: SqlExecutor = this.dataSource,
  ): Promise<string | null> {
    const rows = await queryRows<TeamRow>(
      executor,
      `
        SELECT u.team_id
        FROM users u
        WHERE u.id = $1
        LIMIT 1
      `,
      [userId],
    );

    return rows[0]?.team_id ?? null;
  }

  async findProcessOwnerTeamId(
    processId: string,
    executor: SqlExecutor = this.dataSource,
  ): Promise<string | null> {
    const rows = await queryRows<TeamRow>(
      executor,
      `
        SELECT u.team_id
        FROM processes p
        INNER JOIN users u ON u.id = p.owner_id
        WHERE p.id = $1
        LIMIT 1
      `,
      [processId],
    );

    return rows[0]?.team_id ?? null;
  }

  async findProcessVersionOwnerTeamId(
    processVersionId: string,
    executor: SqlExecutor = this.dataSource,
  ): Promise<string | null> {
    const rows = await queryRows<TeamRow>(
      executor,
      `
        SELECT u.team_id
        FROM process_versions pv
        INNER JOIN processes p ON p.id = pv.process_id
        INNER JOIN users u ON u.id = p.owner_id
        WHERE pv.id = $1
        LIMIT 1
      `,
      [processVersionId],
    );

    return rows[0]?.team_id ?? null;
  }

  async findProcedureOwnerTeamId(
    procedureId: string,
    executor: SqlExecutor = this.dataSource,
  ): Promise<string | null> {
    const rows = await queryRows<TeamRow>(
      executor,
      `
        SELECT u.team_id
        FROM procedures pr
        INNER JOIN process_versions pv ON pv.id = pr.process_version_id
        INNER JOIN processes p ON p.id = pv.process_id
        INNER JOIN users u ON u.id = p.owner_id
        WHERE pr.id = $1
        LIMIT 1
      `,
      [procedureId],
    );

    return rows[0]?.team_id ?? null;
  }
}
