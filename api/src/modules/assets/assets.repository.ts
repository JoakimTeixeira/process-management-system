import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface QueryRow {
  [key: string]: unknown;
}

interface AssetRow extends QueryRow {
  id: string;
  process_version_id: string;
  caption: string;
  asset_type: string;
  file_path: string;
  mime_type: string;
  checksum: string;
  size_bytes: number;
  is_current: boolean;
  superseded_at: string | null;
  superseded_by_asset_id: string | null;
  created_at: string;
}

export interface AssetRecord {
  id: string;
  processVersionId: string;
  caption: string;
  assetType: string;
  filePath: string;
  mimeType: string;
  checksum: string;
  sizeBytes: number;
  isCurrent: boolean;
  supersededAt: string | null;
  supersededByAssetId: string | null;
  createdAt: string;
}

async function queryRows<T extends QueryRow>(
  dataSource: DataSource,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await dataSource.query(sql, [...parameters]);
}

@Injectable()
export class AssetsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async createBpmnAsset(params: {
    processVersionId: string;
    caption: string;
    filePath: string;
    mimeType: string;
    checksum: string;
    sizeBytes: number;
    actorId: string;
  }): Promise<AssetRecord> {
    const rows = await queryRows<{ id: string }>(
      this.dataSource,
      `
        INSERT INTO assets (
          process_version_id,
          caption,
          asset_type,
          file_path,
          mime_type,
          checksum,
          size_bytes,
          created_by
        )
        VALUES ($1, $2, 'BPMN'::asset_type, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      [
        params.processVersionId,
        params.caption,
        params.filePath,
        params.mimeType,
        params.checksum,
        params.sizeBytes,
        params.actorId,
      ],
    );

    return this.findRequiredById(rows[0]?.id);
  }

  async findByProcessVersionId(
    processVersionId: string,
  ): Promise<AssetRecord[]> {
    const rows = await queryRows<AssetRow>(
      this.dataSource,
      `
        SELECT
          a.id,
          a.process_version_id,
          a.caption,
          a.asset_type,
          a.file_path,
          a.mime_type,
          a.checksum,
          a.size_bytes,
          a.is_current,
          a.superseded_at,
          a.superseded_by_asset_id,
          a.created_at
        FROM assets a
        WHERE a.process_version_id = $1
        ORDER BY a.created_at ASC
      `,
      [processVersionId],
    );

    return rows.map((row) => this.mapRecord(row));
  }

  async findCurrentByProcessVersionId(
    processVersionId: string,
  ): Promise<AssetRecord | null> {
    const rows = await queryRows<AssetRow>(
      this.dataSource,
      `
        SELECT
          a.id,
          a.process_version_id,
          a.caption,
          a.asset_type,
          a.file_path,
          a.mime_type,
          a.checksum,
          a.size_bytes,
          a.is_current,
          a.superseded_at,
          a.superseded_by_asset_id,
          a.created_at
        FROM assets a
        WHERE a.process_version_id = $1
          AND a.is_current = TRUE
        LIMIT 1
      `,
      [processVersionId],
    );

    return rows[0] ? this.mapRecord(rows[0]) : null;
  }

  async supersedeAsset(assetId: string, newAssetId: string): Promise<void> {
    await this.dataSource.query(
      `
        UPDATE assets
        SET is_current = FALSE,
            superseded_at = CURRENT_TIMESTAMP,
            superseded_by_asset_id = $2
        WHERE id = $1
      `,
      [assetId, newAssetId],
    );
  }

  async findById(id: string): Promise<AssetRecord | null> {
    const rows = await queryRows<AssetRow>(
      this.dataSource,
      `
        SELECT
          a.id,
          a.process_version_id,
          a.caption,
          a.asset_type,
          a.file_path,
          a.mime_type,
          a.checksum,
          a.size_bytes,
          a.is_current,
          a.superseded_at,
          a.superseded_by_asset_id,
          a.created_at
        FROM assets a
        WHERE a.id = $1
        LIMIT 1
      `,
      [id],
    );

    return rows[0] ? this.mapRecord(rows[0]) : null;
  }

  private async findRequiredById(id: string | undefined): Promise<AssetRecord> {
    if (!id) {
      throw new TypeError('Expected asset identifier to be available');
    }

    const asset = await this.findById(id);

    if (!asset) {
      throw new TypeError(`Expected asset "${id}" to exist`);
    }

    return asset;
  }

  private mapRecord(row: AssetRow): AssetRecord {
    return {
      id: row.id,
      processVersionId: row.process_version_id,
      caption: row.caption,
      assetType: row.asset_type,
      filePath: row.file_path,
      mimeType: row.mime_type,
      checksum: row.checksum,
      sizeBytes: row.size_bytes,
      isCurrent: row.is_current,
      supersededAt: row.superseded_at,
      supersededByAssetId: row.superseded_by_asset_id,
      createdAt: row.created_at,
    };
  }
}
