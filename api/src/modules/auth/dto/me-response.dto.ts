import { Expose, Type } from 'class-transformer';

class RoleSummaryDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;
}

class TeamSummaryDto {
  @Expose()
  id!: string;

  @Expose()
  code!: string;

  @Expose()
  name!: string;
}

export class MeResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  @Type(() => RoleSummaryDto)
  role!: RoleSummaryDto;

  @Expose()
  @Type(() => TeamSummaryDto)
  team!: TeamSummaryDto | null;

  constructor(partial: Partial<MeResponseDto>) {
    Object.assign(this, partial);
  }
}
