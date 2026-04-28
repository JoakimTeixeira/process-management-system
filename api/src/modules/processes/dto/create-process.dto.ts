import { Transform } from 'class-transformer';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class CreateProcessDto {
  @ApiProperty({
    description: 'Business-facing title of the process.',
    example: 'Incident Resolution',
    maxLength: MAX_TEXT_LENGTH,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  title!: string;

  @ApiProperty({
    description: 'Short description of the process scope.',
    example: 'Restores affected services after incidents are diagnosed.',
    maxLength: MAX_TEXT_LENGTH,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  description!: string;

  @ApiProperty({
    description: 'Owning team UUID for the process.',
    format: 'uuid',
  })
  @IsUUID()
  teamId!: string;

  @ApiProperty({
    description: 'Owner UUID for the process.',
    format: 'uuid',
  })
  @IsUUID()
  ownerId!: string;

  @ApiProperty({
    description: 'Parent area UUID for the process.',
    format: 'uuid',
  })
  @IsUUID()
  areaId!: string;
}
