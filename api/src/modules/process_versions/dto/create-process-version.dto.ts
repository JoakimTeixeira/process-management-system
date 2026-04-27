import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class CreateProcessVersionDto {
  @IsIn(['AS-IS', 'TO-BE'])
  architectureState!: 'AS-IS' | 'TO-BE';

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
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
  @IsUUID()
  derivedFromVersionId?: string;
}
