import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  MAX_CODE_LENGTH,
  MAX_TEXT_LENGTH,
} from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class CreateItilPracticeDto {
  @ApiProperty({
    description: 'Short reference code for the ITIL practice.',
    example: 'ITIL-IM',
    maxLength: MAX_CODE_LENGTH,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CODE_LENGTH)
  code!: string;

  @ApiProperty({
    description: 'Display name of the ITIL practice.',
    example: 'Incident Management',
    maxLength: MAX_TEXT_LENGTH,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional descriptive summary of the practice.',
    example:
      'The practice for minimizing the negative impact of incidents by restoring normal service operation quickly.',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  description?: string;
}
