import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class UpdateAreaDto {
  @ApiPropertyOptional({
    description: 'Updated business-facing title of the area.',
    example: 'Service Validation and Testing',
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated owning team UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'Updated owner UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Updated linked ITIL practice UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  itilPracticeId?: string;

  @ApiPropertyOptional({
    description: 'Updated description of the area scope.',
    example: 'Coordinates testing and validation before release.',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  description?: string;
}
