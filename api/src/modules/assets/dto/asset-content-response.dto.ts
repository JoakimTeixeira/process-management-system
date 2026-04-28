import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AssetContentResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the asset.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Human-readable caption for the asset.',
  })
  @Expose()
  caption!: string;

  @ApiProperty({
    description: 'Storage path of the asset in the backend.',
  })
  @Expose()
  filePath!: string;

  @ApiProperty({
    description: 'MIME type of the asset content.',
    example: 'application/xml',
  })
  @Expose()
  mimeType!: string;

  @ApiProperty({
    description: 'Decoded asset content returned by the API.',
  })
  @Expose()
  content!: string;

  constructor(partial: Partial<AssetContentResponseDto>) {
    Object.assign(this, partial);
  }
}
