import { Transform } from 'class-transformer';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { trimString } from '../../../common/utils/trim-string-transform.util';

export class LifecycleJustificationDto {
  @ApiPropertyOptional({
    description:
      'Optional justification recorded against the lifecycle action.',
    example: 'Checklist verified and ready for reviewer assessment.',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  reason?: string;
}
