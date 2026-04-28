import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class UpdateGlossaryTermDto {
  @ApiPropertyOptional({
    description: 'Updated glossary term label.',
    example: 'Major incident management',
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  term?: string;

  @ApiPropertyOptional({
    description: 'Updated glossary definition.',
    example:
      'The coordinated handling of high-impact incidents that require urgent restoration and communication.',
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  definition?: string;

  @ApiPropertyOptional({
    description: 'Updated glossary category. Use null to clear the category.',
    example: 'Operations',
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
    description: 'Whether the term remains the preferred entry.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;
}
