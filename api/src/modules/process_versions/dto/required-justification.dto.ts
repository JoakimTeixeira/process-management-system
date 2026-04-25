import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

import { trimString } from '../../../common/utils/trim-string-transform.util';

export class RequiredJustificationDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  reason!: string;
}
