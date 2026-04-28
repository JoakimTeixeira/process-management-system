import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { GlossaryPracticeResponseDto } from './glossary-practice-response.dto';
import { GlossaryTermResponseDto } from './glossary-term-response.dto';

export class PublicGlossaryResponseDto {
  @ApiProperty({
    description: 'Published glossary terms available to public portal users.',
    type: () => GlossaryTermResponseDto,
    isArray: true,
  })
  @Expose()
  @Type(() => GlossaryTermResponseDto)
  terms!: GlossaryTermResponseDto[];

  @ApiProperty({
    description: 'ITIL practices surfaced alongside glossary terms.',
    type: () => GlossaryPracticeResponseDto,
    isArray: true,
  })
  @Expose()
  @Type(() => GlossaryPracticeResponseDto)
  practices!: GlossaryPracticeResponseDto[];

  constructor(partial: Partial<PublicGlossaryResponseDto>) {
    Object.assign(this, partial);
  }
}
