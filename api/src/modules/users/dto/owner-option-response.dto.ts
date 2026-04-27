import { Expose } from 'class-transformer';

export class OwnerOptionResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  teamId!: string;

  constructor(partial: Partial<OwnerOptionResponseDto>) {
    Object.assign(this, partial);
  }
}
