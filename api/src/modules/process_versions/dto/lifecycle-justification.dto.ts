import { Transform } from 'class-transformer';
import { IsOptional, IsString, MinLength } from 'class-validator';

import { trimString } from '../../../common/utils/trim-string-transform.util';

export class LifecycleJustificationDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  reason?: string;
}
