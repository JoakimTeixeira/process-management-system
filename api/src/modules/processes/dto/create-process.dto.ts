import { Transform } from 'class-transformer';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import { trimString } from '../../../common/utils/trim-string-transform.util';

export class CreateProcessDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(1)
  description!: string;

  @IsUUID()
  ownerId!: string;

  @IsUUID()
  areaId!: string;
}
