import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class UserRoleSummaryDto {
  @ApiProperty({
    description: 'Unique identifier for the assigned role.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Assigned role name.',
  })
  @Expose()
  name!: string;
}

class UserTeamSummaryDto {
  @ApiProperty({
    description: 'Unique identifier for the assigned team.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Short team reference code.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Display name for the assigned team.',
  })
  @Expose()
  name!: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Display name for the user.',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'Email address used by the user.',
    example: 'alice.editor@pms.local',
  })
  @Expose()
  email!: string;

  @ApiProperty({
    description: 'Whether the user is currently active.',
  })
  @Expose()
  isActive!: boolean;

  @ApiProperty({
    description: 'Assigned role summary.',
    type: () => UserRoleSummaryDto,
  })
  @Expose()
  @Type(() => UserRoleSummaryDto)
  role!: UserRoleSummaryDto;

  @ApiProperty({
    description: 'Assigned team summary.',
    type: () => UserTeamSummaryDto,
  })
  @Expose()
  @Type(() => UserTeamSummaryDto)
  team!: UserTeamSummaryDto;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
