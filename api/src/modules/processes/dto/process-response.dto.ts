import { Expose } from 'class-transformer';

export class ProcessResponseDto {
  @Expose()
  id!: string;

  @Expose()
  areaId!: string;

  @Expose()
  code!: string;

  @Expose()
  title!: string;

  @Expose()
  description!: string | null;

  @Expose()
  ownerId!: string;

  constructor(partial: Partial<ProcessResponseDto>) {
    Object.assign(this, partial);
  }
}
