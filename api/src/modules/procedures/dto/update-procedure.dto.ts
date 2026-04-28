import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';
import { ProcedureActivityDto } from './shared-procedure.dto';

function trimStringArray({ value }: { value: unknown }): unknown {
  return Array.isArray(value)
    ? value.map<unknown>((entry: unknown) =>
        typeof entry === 'string' ? entry.trim() : entry,
      )
    : value;
}

export class UpdateProcedureDto {
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
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProcedureActivityDto)
  activities?: ProcedureActivityDto[];

  @IsOptional()
  @Transform(trimStringArray)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  inputs?: string[];

  @IsOptional()
  @Transform(trimStringArray)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  outputs?: string[];
}
