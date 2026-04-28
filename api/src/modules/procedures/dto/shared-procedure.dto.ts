import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

function trimStringArray({ value }: { value: unknown }): unknown {
  return Array.isArray(value)
    ? value.map<unknown>((entry: unknown) =>
        typeof entry === 'string' ? entry.trim() : entry,
      )
    : value;
}

export class ProcedureActivityDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  resource!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  serviceAction!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  workInstruction!: string;
}

export class ProcedureBodyDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  title!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  utility!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  warranty!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  outcome!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  policy!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProcedureActivityDto)
  activities!: ProcedureActivityDto[];

  @Transform(trimStringArray)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  inputs!: string[];

  @Transform(trimStringArray)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  outputs!: string[];
}
