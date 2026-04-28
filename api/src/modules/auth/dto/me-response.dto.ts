import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class RoleSummaryDto {
  @ApiProperty({
    description: 'Unique identifier for the assigned role.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Name of the assigned role.',
  })
  @Expose()
  name!: string;
}

class TeamSummaryDto {
  @ApiProperty({
    description: 'Unique identifier for the assigned team.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Short code of the assigned team.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Display name of the assigned team.',
  })
  @Expose()
  name!: string;
}

export class MeResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the authenticated user.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Display name of the authenticated user.',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'Email address of the authenticated user.',
    example: 'editor@pms.local',
  })
  @Expose()
  email!: string;

  @ApiProperty({
    description: 'Role resolved from the authenticated JWT.',
    type: () => RoleSummaryDto,
  })
  @Expose()
  @Type(() => RoleSummaryDto)
  role!: RoleSummaryDto;

  @ApiProperty({
    description: 'Team resolved from the authenticated JWT, if present.',
    type: () => TeamSummaryDto,
    nullable: true,
  })
  @Expose()
  @Type(() => TeamSummaryDto)
  team!: TeamSummaryDto | null;

  constructor(partial: Partial<MeResponseDto>) {
    Object.assign(this, partial);
  }
}
