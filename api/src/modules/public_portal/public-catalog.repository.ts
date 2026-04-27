import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import type {
  PublicAreaRow,
  PublicCatalogSearchRow,
} from './public-portal.repository.types';
import { queryRows } from './public-portal.repository.helpers';

@Injectable()
export class PublicCatalogRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async listAreas(): Promise<PublicAreaRow[]> {
    return await queryRows<PublicAreaRow>(
      this.dataSource,
      `
        SELECT DISTINCT
          a.id,
          a.code,
          a.title
        FROM areas a
        INNER JOIN processes p ON p.area_id = a.id
        INNER JOIN process_versions pv
          ON pv.process_id = p.id
         AND pv.lifecycle_state = 'Published'::process_lifecycle_state
        ORDER BY a.title ASC
      `,
    );
  }

  async searchCatalog(searchTerm: string): Promise<PublicCatalogSearchRow[]> {
    return await queryRows<PublicCatalogSearchRow>(
      this.dataSource,
      `
        WITH search_term AS (
          SELECT
            normalize_search_text($1) AS term,
            '%' || normalize_search_text($1) || '%' AS pattern
        )
        SELECT
          'Area' AS kind,
          a.code AS code,
          a.title AS title,
          'Area' AS subtitle,
          '/catalog/processes?areaId=' || a.id AS href,
          1 AS sort_kind,
          a.title AS sort_title,
          GREATEST(
            similarity(a.search_document, st.term),
            word_similarity(st.term, a.search_document),
            strict_word_similarity(st.term, a.search_document),
            CASE
              WHEN a.search_document LIKE st.pattern THEN 1.0
              ELSE 0.0
            END
          ) AS similarity_score
        FROM areas a
        CROSS JOIN search_term st
        WHERE (
            a.search_document LIKE st.pattern
            OR a.search_document % st.term
            OR word_similarity(st.term, a.search_document) >= 0.35
          )
          AND EXISTS (
            SELECT 1
            FROM processes p
            INNER JOIN process_versions pv
              ON pv.process_id = p.id
             AND pv.lifecycle_state = 'Published'::process_lifecycle_state
            WHERE p.area_id = a.id
          )
        GROUP BY a.id, a.code, a.title, a.search_document, st.term, st.pattern

        UNION ALL

        SELECT
          'Process' AS kind,
          p.code AS code,
          p.title AS title,
          a.title || ' | ' || ip.name AS subtitle,
          '/catalog/processes/' || p.id || '?view=' || CASE
            WHEN BOOL_OR(pv.architecture_state = 'AS-IS'::process_architecture_state)
              THEN 'as-is'
            ELSE 'to-be'
          END AS href,
          2 AS sort_kind,
          p.title AS sort_title,
          GREATEST(
            similarity(p.search_document, st.term),
            similarity(a.search_document, st.term),
            similarity(ip.search_document, st.term),
            word_similarity(st.term, p.search_document),
            word_similarity(st.term, a.search_document),
            word_similarity(st.term, ip.search_document),
            strict_word_similarity(st.term, p.search_document),
            strict_word_similarity(st.term, a.search_document),
            strict_word_similarity(st.term, ip.search_document),
            CASE
              WHEN p.search_document LIKE st.pattern THEN 1.0
              ELSE 0.0
            END,
            CASE
              WHEN a.search_document LIKE st.pattern THEN 1.0
              ELSE 0.0
            END,
            CASE
              WHEN ip.search_document LIKE st.pattern THEN 1.0
              ELSE 0.0
            END
          ) AS similarity_score
        FROM processes p
        INNER JOIN areas a ON a.id = p.area_id
        INNER JOIN itil_practices ip ON ip.id = a.itil_practice_id
        INNER JOIN process_versions pv
          ON pv.process_id = p.id
         AND pv.lifecycle_state = 'Published'::process_lifecycle_state
        CROSS JOIN search_term st
        WHERE
          p.search_document LIKE st.pattern
          OR p.search_document % st.term
          OR word_similarity(st.term, p.search_document) >= 0.35
          OR a.search_document LIKE st.pattern
          OR a.search_document % st.term
          OR word_similarity(st.term, a.search_document) >= 0.35
          OR ip.search_document LIKE st.pattern
          OR ip.search_document % st.term
          OR word_similarity(st.term, ip.search_document) >= 0.35
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
                pv_search.search_document LIKE st.pattern
                OR pv_search.search_document % st.term
                OR word_similarity(st.term, pv_search.search_document) >= 0.35
                OR COALESCE(pr_search.search_document, '') LIKE st.pattern
                OR COALESCE(pr_search.search_document, '') % st.term
                OR word_similarity(st.term, COALESCE(pr_search.search_document, '')) >= 0.35
                OR COALESCE(asset_search.search_document, '') LIKE st.pattern
                OR COALESCE(asset_search.search_document, '') % st.term
                OR word_similarity(st.term, COALESCE(asset_search.search_document, '')) >= 0.35
              )
          )
        GROUP BY
          p.id,
          p.code,
          p.title,
          a.title,
          ip.name,
          p.search_document,
          a.search_document,
          ip.search_document,
          st.term,
          st.pattern

        UNION ALL

        SELECT
          'Procedure' AS kind,
          pr.code AS code,
          pr.title AS title,
          p.title || ' | ' || a.title AS subtitle,
          '/catalog/procedures/' || pr.id AS href,
          3 AS sort_kind,
          pr.title AS sort_title,
          GREATEST(
            similarity(pr.search_document, st.term),
            word_similarity(st.term, pr.search_document),
            strict_word_similarity(st.term, pr.search_document),
            CASE
              WHEN pr.search_document LIKE st.pattern THEN 1.0
              ELSE 0.0
            END
          ) AS similarity_score
        FROM procedures pr
        INNER JOIN process_versions pv
          ON pv.id = pr.process_version_id
         AND pv.lifecycle_state = 'Published'::process_lifecycle_state
        INNER JOIN processes p ON p.id = pv.process_id
        INNER JOIN areas a ON a.id = p.area_id
        CROSS JOIN search_term st
        WHERE
          pr.search_document LIKE st.pattern
          OR pr.search_document % st.term
          OR word_similarity(st.term, pr.search_document) >= 0.35
        GROUP BY
          pr.id,
          pr.code,
          pr.title,
          p.title,
          a.title,
          pr.search_document,
          st.term,
          st.pattern

        UNION ALL

        SELECT
          'Asset' AS kind,
          COALESCE(asset.caption, asset.file_path) AS code,
          COALESCE(asset.caption, 'BPMN asset') AS title,
          p.title || ' | ' || CASE
            WHEN pv.architecture_state = 'AS-IS'::process_architecture_state THEN 'Current State'
            ELSE 'Target State'
          END AS subtitle,
          '/catalog/processes/' || p.id || '/diagram?view=' || CASE
            WHEN pv.architecture_state = 'AS-IS'::process_architecture_state
              THEN 'as-is'
            ELSE 'to-be'
          END AS href,
          4 AS sort_kind,
          COALESCE(asset.caption, asset.file_path) AS sort_title,
          GREATEST(
            similarity(asset.search_document, st.term),
            word_similarity(st.term, asset.search_document),
            strict_word_similarity(st.term, asset.search_document),
            CASE
              WHEN asset.search_document LIKE st.pattern THEN 1.0
              ELSE 0.0
            END
          ) AS similarity_score
        FROM assets asset
        INNER JOIN process_versions pv
          ON pv.id = asset.process_version_id
         AND pv.lifecycle_state = 'Published'::process_lifecycle_state
        INNER JOIN processes p ON p.id = pv.process_id
        CROSS JOIN search_term st
        WHERE
          asset.search_document LIKE st.pattern
          OR asset.search_document % st.term
          OR word_similarity(st.term, asset.search_document) >= 0.35
        GROUP BY
          asset.id,
          asset.caption,
          asset.file_path,
          p.title,
          pv.architecture_state,
          p.id,
          asset.search_document,
          st.term,
          st.pattern

        ORDER BY similarity_score DESC, sort_kind, sort_title
        LIMIT 12
      `,
      [searchTerm],
    );
  }
}
