import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  MAX_CODE_LENGTH,
  MAX_TEXT_LENGTH,
} from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class UpdateTeamDto {
  @ApiPropertyOptional({
    description: 'Updated short reference code for the team.',
    example: 'OPS',
    maxLength: MAX_CODE_LENGTH,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CODE_LENGTH)
  code?: string;

  @ApiPropertyOptional({
    description: 'Updated display name for the team.',
    example: 'Operations and Support',
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated business description for the team.',
    example:
      'Technical operations team responsible for platform administration, infrastructure maintenance, and support.',
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  description?: string;
}
