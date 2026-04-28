import { Expose } from 'class-transformer';

export class OwnerOptionResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  teamId!: string;

  @Expose()
  isActive!: boolean;

  constructor(partial: Partial<OwnerOptionResponseDto>) {
    Object.assign(this, partial);
  }
}
