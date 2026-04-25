import { Expose } from 'class-transformer';

export class VersionStateHistoryResponseDto {
  @Expose()
  id!: string;

  @Expose()
  processVersionId!: string;

  @Expose()
  fromState!: string | null;

  @Expose()
  toState!: string;

  @Expose()
  actorId!: string | null;

  @Expose()
  reason!: string | null;

  @Expose()
  createdAt!: Date;

  constructor(partial: Partial<VersionStateHistoryResponseDto>) {
    Object.assign(this, partial);
  }
}
