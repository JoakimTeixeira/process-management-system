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

export class UpdateProcessDto {
  @ApiPropertyOptional({
    description: 'Updated business-facing title of the process.',
    example: 'Major Incident Resolution',
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated short description of the process scope.',
    example: 'Coordinates restoration for high-priority incidents.',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  description?: string;

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
    description: 'Updated parent area UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  areaId?: string;
}
