import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ProcessVersionAction } from '../../../common/enums/process-version-action.enum';

export class ProcessVersionResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the process version.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Parent process UUID.',
    format: 'uuid',
  })
  @Expose()
  processId!: string;

  @ApiProperty({
    description: 'Human-readable version number.',
    example: 3,
  })
  @Expose()
  versionNumber!: number;

  @ApiProperty({
    description: 'Current lifecycle state.',
    example: 'DRAFT',
  })
  @Expose()
  lifecycleState!: string;

  @ApiProperty({
    description: 'Architecture state represented by the version.',
    example: 'TO-BE',
  })
  @Expose()
  architectureState!: string;

  @ApiProperty({
    description: 'Business-facing version title.',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Whether the governance checklist has been completed.',
  })
  @Expose()
  checklistCompleted!: boolean;

  @ApiProperty({
    description: 'UUID of the version this draft was derived from, if any.',
    format: 'uuid',
    nullable: true,
  })
  @Expose()
  derivedFromVersionId!: string | null;

  @ApiProperty({
    description: 'Description of the changes captured in the version.',
  })
  @Expose()
  changeDescription!: string;

  @ApiProperty({
    description: 'Business reason for the version changes.',
  })
  @Expose()
  reasonForChange!: string;

  @ApiPropertyOptional({
    description: 'Actions currently available to the authenticated user.',
    enum: ProcessVersionAction,
    isArray: true,
  })
  @Expose()
  availableActions?: ProcessVersionAction[];

  constructor(partial: Partial<ProcessVersionResponseDto>) {
    Object.assign(this, partial);
  }
}
