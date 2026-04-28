import { Transform } from 'class-transformer';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class CreateAreaDto {
  @ApiProperty({
    description: 'Business-facing title of the area.',
    example: 'Service Transition',
    maxLength: MAX_TEXT_LENGTH,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  title!: string;

  @ApiProperty({
    description: 'Short description of the area scope.',
    example: 'Coordinates controlled changes into live service.',
    maxLength: MAX_TEXT_LENGTH,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  description!: string;

  @ApiProperty({
    description: 'Owning team UUID for the area.',
    format: 'uuid',
  })
  @IsUUID()
  teamId!: string;

  @ApiProperty({
    description: 'Owner UUID for the area.',
    format: 'uuid',
  })
  @IsUUID()
  ownerId!: string;

  @ApiProperty({
    description: 'Linked ITIL practice UUID.',
    format: 'uuid',
  })
  @IsUUID()
  itilPracticeId!: string;
}
