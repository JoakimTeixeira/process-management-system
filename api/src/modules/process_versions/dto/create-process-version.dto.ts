import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { trimString } from '../../../common/utils/trim-string-transform.util';

export class CreateProcessVersionDto {
  @IsInt()
  @Min(1)
  versionNumber!: number;

  @IsIn(['AS-IS', 'TO-BE'])
  architectureState!: 'AS-IS' | 'TO-BE';

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  changeDescription!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  reasonForChange!: string;

  @IsOptional()
  @IsBoolean()
  checklistCompleted?: boolean;

  @IsOptional()
  @IsUUID()
  derivedFromVersionId?: string;
}
