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

import { trimString } from '../../../common/utils/trim-string-transform.util';
import { ProcedureActivityDto } from './shared-procedure.dto';

export class UpdateProcedureDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^\d+(?:\.\d+)+$/, {
    message: 'code must be a string hierarchical identifier such as "1.1"',
  })
  code?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
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
