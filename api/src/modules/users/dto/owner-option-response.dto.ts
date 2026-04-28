import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OwnerOptionResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the selectable owner.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Display name for the selectable owner.',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'Team UUID associated with the owner.',
    format: 'uuid',
  })
  @Expose()
  teamId!: string;

  @ApiProperty({
    description: 'Whether the owner account is currently active.',
  })
  @Expose()
  isActive!: boolean;

  constructor(partial: Partial<OwnerOptionResponseDto>) {
    Object.assign(this, partial);
  }
}
