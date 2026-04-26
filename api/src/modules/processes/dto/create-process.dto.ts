import { Transform } from 'class-transformer';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class CreateProcessDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
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
