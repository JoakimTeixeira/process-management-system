import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import {
  ARCHITECTURE_STATES,
  type ArchitectureState,
} from '../../../common/enums/architecture-state.enum';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class UpdateProcessVersionDto {
  @ApiPropertyOptional({
    description: 'Updated architecture state for the version.',
    enum: ARCHITECTURE_STATES,
  })
  @IsOptional()
  @IsIn(ARCHITECTURE_STATES)
  architectureState?: ArchitectureState;

  @ApiPropertyOptional({
    description: 'Updated business-facing title of the process version.',
    example: 'Major Incident Resolution v2',
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  title?: string;

  @ApiPropertyOptional({
    description: 'Whether the required version checklist has been completed.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  checklistCompleted?: boolean;

  @ApiPropertyOptional({
    description: 'Updated source version UUID for derivation traceability.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  derivedFromVersionId?: string;

  @ApiPropertyOptional({
    description: 'Updated description of the changes in this version.',
    example: 'Refined approval gates and assignment rules.',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  changeDescription?: string;

  @ApiPropertyOptional({
    description: 'Updated rationale for the version changes.',
    example: 'Reflects the target-state governance controls.',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  reasonForChange?: string;
}
