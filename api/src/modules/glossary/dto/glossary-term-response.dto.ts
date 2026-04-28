import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GlossaryTermResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the glossary term.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Published glossary term label.',
    example: 'Incident management',
  })
  @Expose()
  term!: string;

  @ApiProperty({
    description: 'Definition presented to users.',
    example:
      'The practice for minimizing the negative impact of incidents by restoring normal service operation as quickly as possible.',
  })
  @Expose()
  definition!: string;

  @ApiProperty({
    description: 'Optional grouping category for the term.',
    example: 'ITIL',
    nullable: true,
  })
  @Expose()
  category!: string | null;

  @ApiProperty({
    description: 'Whether this term is the preferred wording.',
    example: true,
  })
  @Expose()
  isPreferred!: boolean;

  @ApiProperty({
    description: 'Identifier of the user who created the term.',
    format: 'uuid',
    nullable: true,
  })
  @Expose()
  createdBy!: string | null;

  constructor(partial: Partial<GlossaryTermResponseDto>) {
    Object.assign(this, partial);
  }
}
