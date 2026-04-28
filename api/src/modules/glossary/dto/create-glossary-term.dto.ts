import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class CreateGlossaryTermDto {
  @ApiProperty({
    description: 'The preferred glossary term to publish in the catalogue.',
    example: 'Incident management',
    maxLength: MAX_TEXT_LENGTH,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  term!: string;

  @ApiProperty({
    description: 'The definition shown to backoffice and public portal users.',
    example:
      'The practice for minimizing the negative impact of incidents by restoring normal service operation as quickly as possible.',
    maxLength: MAX_TEXT_LENGTH,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  definition!: string;

  @ApiPropertyOptional({
    description: 'Optional category label used to group glossary entries.',
    example: 'ITIL',
    maxLength: MAX_TEXT_LENGTH,
    nullable: true,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  category?: string | null;

  @ApiPropertyOptional({
    description:
      'Whether this term is marked as the preferred wording in the glossary.',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;
}
