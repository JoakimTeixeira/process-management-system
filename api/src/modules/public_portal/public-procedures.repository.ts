import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { queryRows } from './public-portal.repository.helpers';
import type { PublicProcedureSummaryRow } from './public-portal.repository.types';
import type { PublicProcedureFilters } from './public-portal.types';

const PROCEDURE_SUMMARY_SELECT = `
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
    pr.outputs,
    p.id AS process_id,
    p.code AS process_code,
    p.title AS process_title,
    a.id AS area_id,
    a.code AS area_code,
    a.title AS area_title,
    ip.id AS practice_id,
    ip.code AS practice_code,
    ip.name AS practice_name,
    pv.version_number,
    pv.architecture_state,
    pv.title AS version_title
  FROM procedures pr
  INNER JOIN process_versions pv
    ON pv.id = pr.process_version_id
   AND pv.lifecycle_state = 'Published'::process_lifecycle_state
  INNER JOIN processes p
    ON p.id = pv.process_id
  INNER JOIN areas a
    ON a.id = p.area_id
  INNER JOIN itil_practices ip
    ON ip.id = a.itil_practice_id
`;

@Injectable()
export class PublicProceduresRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async listProcedures(
    filters: PublicProcedureFilters,
  ): Promise<PublicProcedureSummaryRow[]> {
    const parameters: unknown[] = [];
    const whereClauses: string[] = [];

    if (filters.search && filters.search.trim() !== '') {
      parameters.push(filters.search.trim());
      whereClauses.push(`
        (
          pr.search_document LIKE '%' || normalize_search_text($${parameters.length}) || '%'
          OR pv.search_document LIKE '%' || normalize_search_text($${parameters.length}) || '%'
          OR p.search_document LIKE '%' || normalize_search_text($${parameters.length}) || '%'
          OR a.search_document LIKE '%' || normalize_search_text($${parameters.length}) || '%'
          OR ip.search_document LIKE '%' || normalize_search_text($${parameters.length}) || '%'
        )
      `);
    }

    return await queryRows<PublicProcedureSummaryRow>(
      this.dataSource,
      `
        ${PROCEDURE_SUMMARY_SELECT}
        ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''}
        ORDER BY pr.code ASC
      `,
      parameters,
    );
  }

  async listPublishedProceduresByVersionId(
    processVersionId: string,
  ): Promise<PublicProcedureSummaryRow[]> {
    return await queryRows<PublicProcedureSummaryRow>(
      this.dataSource,
      `
        ${PROCEDURE_SUMMARY_SELECT}
        WHERE pr.process_version_id = $1
        ORDER BY pr.code ASC
      `,
      [processVersionId],
    );
  }

  async findProcedureDetail(
    procedureId: string,
  ): Promise<PublicProcedureSummaryRow | null> {
    const rows = await queryRows<PublicProcedureSummaryRow>(
      this.dataSource,
      `
        ${PROCEDURE_SUMMARY_SELECT}
        WHERE pr.id = $1
        LIMIT 1
      `,
      [procedureId],
    );

    return rows[0] ?? null;
  }
}
