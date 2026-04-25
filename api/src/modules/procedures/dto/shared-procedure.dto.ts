import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { trimString } from '../../../common/utils/trim-string-transform.util';

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
  @MaxLength(50)
  @Matches(/^\d+(?:\.\d+)+$/, {
    message: 'code must be a string hierarchical identifier such as "1.1"',
  })
  code!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
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
  @ValidateNested({ each: true })
  @Type(() => ProcedureActivityDto)
  activities!: ProcedureActivityDto[];

  @IsArray()
  @IsString({ each: true })
  inputs!: string[];

  @IsArray()
  @IsString({ each: true })
  outputs!: string[];
}
