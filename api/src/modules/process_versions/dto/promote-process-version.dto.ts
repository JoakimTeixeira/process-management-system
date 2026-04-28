import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class PromoteProcessVersionDto {
  @ApiProperty({
    description: 'Justification recorded for promoting the version.',
    example:
      'Approved target-state process now becomes the active working baseline.',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  justification!: string;

  @ApiPropertyOptional({
    description: 'Optional replacement title for the promoted version.',
    example: 'Incident Resolution v3',
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  title?: string;
}
