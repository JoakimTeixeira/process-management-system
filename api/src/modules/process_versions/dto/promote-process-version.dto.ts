import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { trimString } from '../../../common/utils/trim-string-transform.util';

export class PromoteProcessVersionDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  justification!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;
}
