import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GlossaryPracticeResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the linked ITIL practice.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Short reference code for the ITIL practice.',
    example: 'ITIL-IM',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Practice name displayed in the glossary payload.',
    example: 'Incident Management',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'Practice description for public glossary consumers.',
    example:
      'The practice for minimizing the negative impact of incidents by restoring normal service operation as quickly as possible.',
  })
  @Expose()
  description!: string;

  constructor(partial: Partial<GlossaryPracticeResponseDto>) {
    Object.assign(this, partial);
  }
}
