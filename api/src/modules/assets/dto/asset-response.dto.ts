import { Expose } from 'class-transformer';

export class AssetResponseDto {
  @Expose()
  id!: string;

  @Expose()
  processVersionId!: string;

  @Expose()
  caption!: string;

  @Expose()
  assetType!: string;

  @Expose()
  filePath!: string;

  @Expose()
  mimeType!: string;

  @Expose()
  checksum!: string;

  @Expose()
  sizeBytes!: number;

  @Expose()
  isCurrent!: boolean;

  @Expose()
  supersededAt!: string | null;

  @Expose()
  supersededByAssetId!: string | null;

  @Expose()
  createdAt!: string;

  constructor(partial: Partial<AssetResponseDto>) {
    Object.assign(this, partial);
  }
}
