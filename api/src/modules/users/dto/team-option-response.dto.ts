import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TeamOptionResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the selectable team.',
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
    description: 'Display name for the team.',
  })
  @Expose()
  name!: string;

  constructor(partial: Partial<TeamOptionResponseDto>) {
    Object.assign(this, partial);
  }
}
