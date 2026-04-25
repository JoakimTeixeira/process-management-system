import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { trimString } from '../../../common/utils/trim-string-transform.util';

export class UpdateProcessVersionDto {
  @IsOptional()
  @IsIn(['AS-IS', 'TO-BE'])
  architectureState?: 'AS-IS' | 'TO-BE';

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsBoolean()
  checklistCompleted?: boolean;

  @IsOptional()
  @IsUUID()
  derivedFromVersionId?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  changeDescription?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  reasonForChange?: string;
}
