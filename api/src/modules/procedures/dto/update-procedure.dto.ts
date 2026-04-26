import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import {
  MAX_CODE_LENGTH,
  MAX_TEXT_LENGTH,
} from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';
import { ProcedureActivityDto } from './shared-procedure.dto';

export class UpdateProcedureDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CODE_LENGTH)
  @Matches(/^\d+(?:\.\d+)+$/, {
    message: 'code must be a string hierarchical identifier such as "1.1"',
  })
  code?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  title?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  utility?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  warranty?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  outcome?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  policy?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcedureActivityDto)
  activities?: ProcedureActivityDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inputs?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  outputs?: string[];
}
