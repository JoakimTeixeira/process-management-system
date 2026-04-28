import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AssetResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the asset.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Parent process version UUID.',
    format: 'uuid',
  })
  @Expose()
  processVersionId!: string;

  @ApiProperty({
    description: 'Human-readable caption for the asset.',
  })
  @Expose()
  caption!: string;

  @ApiProperty({
    description: 'Asset classification stored by the backend.',
    example: 'BPMN',
  })
  @Expose()
  assetType!: string;

  @ApiProperty({
    description: 'Storage path of the asset in the backend.',
  })
  @Expose()
  filePath!: string;

  @ApiProperty({
    description: 'MIME type of the uploaded asset.',
    example: 'application/xml',
  })
  @Expose()
  mimeType!: string;

  @ApiProperty({
    description: 'Checksum recorded for file integrity.',
  })
  @Expose()
  checksum!: string;

  @ApiProperty({
    description: 'Asset size in bytes.',
    example: 20480,
  })
  @Expose()
  sizeBytes!: number;

  @ApiProperty({
    description:
      'Whether this asset is the active asset for the process version.',
  })
  @Expose()
  isCurrent!: boolean;

  @ApiProperty({
    description: 'Timestamp when the asset was superseded.',
    format: 'date-time',
    nullable: true,
  })
  @Expose()
  supersededAt!: string | null;

  @ApiProperty({
    description:
      'Identifier of the replacement asset, if this one was superseded.',
    format: 'uuid',
    nullable: true,
  })
  @Expose()
  supersededByAssetId!: string | null;

  @ApiProperty({
    description: 'Timestamp when the asset was created.',
    format: 'date-time',
  })
  @Expose()
  createdAt!: string;

  constructor(partial: Partial<AssetResponseDto>) {
    Object.assign(this, partial);
  }
}
