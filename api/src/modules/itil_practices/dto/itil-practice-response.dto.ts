import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ItilPracticeResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the ITIL practice.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Short reference code for the ITIL practice.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Display name of the ITIL practice.',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'Optional descriptive summary of the practice.',
    nullable: true,
  })
  @Expose()
  description!: string | null;

  constructor(partial: Partial<ItilPracticeResponseDto>) {
    Object.assign(this, partial);
  }
}
