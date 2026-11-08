import type { SqlExecutor } from '../types/sql-executor.type';

interface ExistsRow {
  exists: boolean;
}

export async function activeOwnerExists(
  executor: SqlExecutor,
  ownerId: string,
): Promise<boolean> {
  const rows = await executor.query<ExistsRow[]>(
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

export async function activeTeamExists(
  executor: SqlExecutor,
  teamId: string,
): Promise<boolean> {
  const rows = await executor.query<ExistsRow[]>(
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

export async function activeUserBelongsToTeam(
  executor: SqlExecutor,
  userId: string,
  teamId: string,
): Promise<boolean> {
  const rows = await executor.query<ExistsRow[]>(
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

export function buildParameterizedUpdateStatement(
  tableName: 'areas' | 'processes',
  columnValues: ReadonlyArray<readonly [string, unknown]>,
  actorId: string,
  id: string,
): { sql: string; parameters: unknown[] } {
  const setClauses: string[] = [];
  const parameters: unknown[] = [];

  for (const [column, value] of columnValues) {
    if (value !== undefined) {
      parameters.push(value);
      setClauses.push(`${column} = $${parameters.length}`);
    }
  }

  parameters.push(actorId);
  setClauses.push(`updated_by = $${parameters.length}`);
  parameters.push(id);

  return {
    sql: `
        UPDATE ${tableName}
        SET ${setClauses.join(', ')}
        WHERE id = $${parameters.length}
      `,
    parameters,
  };
}
