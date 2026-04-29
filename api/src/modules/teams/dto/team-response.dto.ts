import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TeamResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the team.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Short reference code for the team.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Display name of the team.',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'Business description of the team.',
  })
  @Expose()
  description!: string;

  @ApiProperty({
    description: 'Whether the team is currently available for selection.',
    example: true,
  })
  @Expose()
  isActive!: boolean;

  constructor(partial: Partial<TeamResponseDto>) {
    Object.assign(this, partial);
  }
}
