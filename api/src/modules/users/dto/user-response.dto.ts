import { Expose, Type } from 'class-transformer';

class UserRoleSummaryDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;
}

class UserTeamSummaryDto {
  @Expose()
  id!: string;

  @Expose()
  code!: string;

  @Expose()
  name!: string;
}

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  isActive!: boolean;

  @Expose()
  @Type(() => UserRoleSummaryDto)
  role!: UserRoleSummaryDto;

  @Expose()
  @Type(() => UserTeamSummaryDto)
  team!: UserTeamSummaryDto;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
