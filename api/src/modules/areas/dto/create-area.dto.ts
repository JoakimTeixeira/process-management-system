import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { trimString } from '../../../common/utils/trim-string-transform.util';

export class CreateAreaDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @IsUUID()
  ownerId!: string;

  @IsUUID()
  itilPracticeId!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  description?: string;
}
