import { Expose } from 'class-transformer';

export class AssetContentResponseDto {
  @Expose()
  id!: string;

  @Expose()
  caption!: string;

  @Expose()
  filePath!: string;

  @Expose()
  mimeType!: string;

  @Expose()
  content!: string;

  constructor(partial: Partial<AssetContentResponseDto>) {
    Object.assign(this, partial);
  }
}
