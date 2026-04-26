import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import {
  MAX_CODE_LENGTH,
  MAX_TEXT_LENGTH,
} from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class CreateItilPracticeDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CODE_LENGTH)
  code!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  name!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  description?: string;
}
