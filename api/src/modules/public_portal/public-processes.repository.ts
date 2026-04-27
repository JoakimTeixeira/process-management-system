import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { queryRows } from './public-portal.repository.helpers';
import type {
  PublicBpmnAssetRow,
  PublicProcessSummaryRow,
  PublicProcessVersionHistoryRow,
  PublicProcessVersionRow,
} from './public-portal.repository.types';
import type {
  ArchitectureState,
  PublicProcessFilters,
} from './public-portal.types';

@Injectable()
export class PublicProcessesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async listProcesses(
    filters: PublicProcessFilters,
  ): Promise<PublicProcessSummaryRow[]> {
    const { parameters, whereClauses, havingClauses } =
      this.buildProcessFilters(filters);

    return await queryRows<PublicProcessSummaryRow>(
      this.dataSource,
      `
        SELECT
          p.id,
          p.code,
          p.title,
          p.description,
          a.id AS area_id,
          a.code AS area_code,
          a.title AS area_title,
          ip.id AS practice_id,
          ip.code AS practice_code,
          ip.name AS practice_name,
          ARRAY_REMOVE(
            ARRAY[
              CASE
                WHEN BOOL_OR(
                  pv.architecture_state = 'AS-IS'::process_architecture_state
                ) THEN 'AS-IS'
              END,
              CASE
                WHEN BOOL_OR(
                  pv.architecture_state = 'TO-BE'::process_architecture_state
                ) THEN 'TO-BE'
              END
            ],
            NULL
          ) AS available_architectures
        FROM processes p
        INNER JOIN areas a ON a.id = p.area_id
        INNER JOIN itil_practices ip ON ip.id = a.itil_practice_id
        INNER JOIN process_versions pv
          ON pv.process_id = p.id
         AND pv.lifecycle_state = 'Published'::process_lifecycle_state
        ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''}
        GROUP BY
          p.id,
          p.code,
          p.title,
          p.description,
          a.id,
          a.code,
          a.title,
          ip.id,
          ip.code,
          ip.name
        ${havingClauses.length > 0 ? `HAVING ${havingClauses.join(' AND ')}` : ''}
        ORDER BY p.code ASC
      `,
      parameters,
    );
  }

  async findPublicProcessBase(
    processId: string,
  ): Promise<PublicProcessSummaryRow | null> {
    const rows = await queryRows<PublicProcessSummaryRow>(
      this.dataSource,
      `
        SELECT
          p.id,
          p.code,
          p.title,
          p.description,
          a.id AS area_id,
          a.code AS area_code,
          a.title AS area_title,
          ip.id AS practice_id,
          ip.code AS practice_code,
          ip.name AS practice_name,
          ARRAY_REMOVE(
            ARRAY[
              CASE
                WHEN BOOL_OR(
                  pv.architecture_state = 'AS-IS'::process_architecture_state
                ) THEN 'AS-IS'
              END,
              CASE
                WHEN BOOL_OR(
                  pv.architecture_state = 'TO-BE'::process_architecture_state
                ) THEN 'TO-BE'
              END
            ],
            NULL
          ) AS available_architectures
        FROM processes p
        INNER JOIN areas a ON a.id = p.area_id
        INNER JOIN itil_practices ip ON ip.id = a.itil_practice_id
        INNER JOIN process_versions pv
          ON pv.process_id = p.id
         AND pv.lifecycle_state = 'Published'::process_lifecycle_state
        WHERE p.id = $1
        GROUP BY
          p.id,
          p.code,
          p.title,
          p.description,
          a.id,
          a.code,
          a.title,
          ip.id,
          ip.code,
          ip.name
        LIMIT 1
      `,
      [processId],
    );

    return rows[0] ?? null;
  }

  async findPublishedProcessVersion(
    processId: string,
    architectureState: ArchitectureState,
  ): Promise<PublicProcessVersionRow | null> {
    const rows = await queryRows<PublicProcessVersionRow>(
      this.dataSource,
      `
        SELECT
          pv.id,
          pv.process_id,
          pv.version_number,
          pv.architecture_state,
          pv.title,
          pv.change_description,
          pv.reason_for_change,
          asset.id AS asset_id,
          COALESCE(asset.caption, asset.file_path) AS asset_caption
        FROM process_versions pv
        LEFT JOIN LATERAL (
          SELECT
            a.id,
            a.caption,
            a.file_path
          FROM assets a
          WHERE a.process_version_id = pv.id
            AND a.asset_type = 'BPMN'::asset_type
          ORDER BY a.created_at ASC
          LIMIT 1
        ) AS asset ON TRUE
        WHERE pv.process_id = $1
          AND pv.lifecycle_state = 'Published'::process_lifecycle_state
          AND pv.architecture_state = $2::process_architecture_state
        LIMIT 1
      `,
      [processId, architectureState],
    );

    return rows[0] ?? null;
  }

  async listProcessVersions(
    processId: string,
  ): Promise<PublicProcessVersionHistoryRow[]> {
    return await queryRows<PublicProcessVersionHistoryRow>(
      this.dataSource,
      `
        SELECT
          pv.id,
          pv.version_number,
          pv.lifecycle_state,
          pv.architecture_state,
          pv.title,
          pv.change_description,
          pv.reason_for_change,
          pv.created_at,
          pv.updated_at,
          pv.derived_from_version_id
        FROM process_versions pv
        WHERE pv.process_id = $1
          AND pv.lifecycle_state IN (
            'Published'::process_lifecycle_state,
            'Archived'::process_lifecycle_state
          )
        ORDER BY pv.version_number DESC, pv.updated_at DESC
      `,
      [processId],
    );
  }

  async findPublishedBpmnAsset(
    processVersionId: string,
  ): Promise<PublicBpmnAssetRow | null> {
    const rows = await queryRows<PublicBpmnAssetRow>(
      this.dataSource,
      `
        SELECT a.file_path
        FROM process_versions pv
        INNER JOIN assets a
          ON a.process_version_id = pv.id
         AND a.asset_type = 'BPMN'::asset_type
        WHERE pv.id = $1
          AND pv.lifecycle_state = 'Published'::process_lifecycle_state
        ORDER BY a.created_at ASC
        LIMIT 1
      `,
      [processVersionId],
    );

    return rows[0] ?? null;
  }

  private buildProcessFilters(filters: PublicProcessFilters): {
    parameters: unknown[];
    whereClauses: string[];
    havingClauses: string[];
  } {
    const parameters: unknown[] = [];
    const whereClauses: string[] = [];
    const havingClauses: string[] = [];

    if (filters.search && filters.search.trim() !== '') {
      parameters.push(filters.search.trim());
      whereClauses.push(`
        (
          p.search_document LIKE '%' || normalize_search_text($${parameters.length}) || '%'
          OR a.search_document LIKE '%' || normalize_search_text($${parameters.length}) || '%'
          OR ip.search_document LIKE '%' || normalize_search_text($${parameters.length}) || '%'
          OR EXISTS (
            SELECT 1
            FROM process_versions pv_search
            LEFT JOIN procedures pr_search
              ON pr_search.process_version_id = pv_search.id
            LEFT JOIN assets asset_search
              ON asset_search.process_version_id = pv_search.id
            WHERE pv_search.process_id = p.id
              AND pv_search.lifecycle_state = 'Published'::process_lifecycle_state
              AND (
                pv_search.search_document LIKE '%' || normalize_search_text($${parameters.length}) || '%'
                OR pr_search.search_document LIKE '%' || normalize_search_text($${parameters.length}) || '%'
                OR asset_search.search_document LIKE '%' || normalize_search_text($${parameters.length}) || '%'
              )
          )
        )
      `);
    }

    if (filters.areaId) {
      parameters.push(filters.areaId);
      whereClauses.push(`a.id = $${parameters.length}`);
    }

    for (const architecture of filters.architectures ?? []) {
      havingClauses.push(
        `BOOL_OR(pv.architecture_state = '${architecture}'::process_architecture_state)`,
      );
    }

    return {
      parameters,
      whereClauses,
      havingClauses,
    };
  }
}
