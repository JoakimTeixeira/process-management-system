import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import {
  ARCHITECTURE_STATES,
  type ArchitectureState,
} from '../../../common/enums/architecture-state.enum';
import { trimString } from '../../../common/utils/trim-string-transform.util';

export class CreateProcessVersionDto {
  @ApiProperty({
    description: 'Architecture state represented by the new process version.',
    enum: ARCHITECTURE_STATES,
    example: 'TO-BE',
  })
  @IsIn(ARCHITECTURE_STATES)
  architectureState!: ArchitectureState;

  @ApiProperty({
    description: 'Business-facing title of the process version.',
    example: 'Major Incident Resolution v2',
    maxLength: MAX_TEXT_LENGTH,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  title!: string;

  @ApiProperty({
    description: 'What has changed in this version.',
    example: 'Introduced escalation checkpoints and clearer ownership.',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  changeDescription!: string;

  @ApiProperty({
    description: 'Why this version is being created.',
    example: 'Align the workflow with the updated incident governance model.',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  reasonForChange!: string;

  @ApiPropertyOptional({
    description: 'Optional source version UUID this draft was derived from.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  derivedFromVersionId?: string;
}
