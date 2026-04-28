import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { trimString } from '../../../common/utils/trim-string-transform.util';

export class RequiredJustificationDto {
  @ApiProperty({
    description: 'Mandatory rationale recorded against the lifecycle action.',
    example: 'Returned to draft because the BPMN model is missing a gateway.',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  reason!: string;
}
