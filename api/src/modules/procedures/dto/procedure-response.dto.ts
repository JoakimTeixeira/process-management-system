import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ProcedureActivityDto } from './shared-procedure.dto';

export class ProcedureResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the procedure.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Parent process version UUID.',
    format: 'uuid',
  })
  @Expose()
  processVersionId!: string;

  @ApiPropertyOptional({
    description:
      'Parent process UUID when returned from cross-version listings.',
    format: 'uuid',
  })
  @Expose()
  processId?: string;

  @ApiPropertyOptional({
    description:
      'Parent process code when returned from cross-version listings.',
  })
  @Expose()
  processCode?: string;

  @ApiPropertyOptional({
    description:
      'Parent process title when returned from cross-version listings.',
  })
  @Expose()
  processTitle?: string;

  @ApiPropertyOptional({
    description:
      'Related version number when returned from cross-version listings.',
    example: 2,
  })
  @Expose()
  versionNumber?: number;

  @ApiPropertyOptional({
    description: 'Lifecycle state of the related process version.',
    example: 'DRAFT',
  })
  @Expose()
  lifecycleState?: string;

  @ApiPropertyOptional({
    description: 'Architecture state of the related process version.',
    example: 'AS-IS',
  })
  @Expose()
  architectureState?: string;

  @ApiProperty({
    description: 'System-generated procedure code.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Procedure title.',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Utility statement for the procedure.',
  })
  @Expose()
  utility!: string;

  @ApiProperty({
    description: 'Warranty statement for the procedure.',
  })
  @Expose()
  warranty!: string;

  @ApiProperty({
    description: 'Expected business or operational outcome.',
  })
  @Expose()
  outcome!: string;

  @ApiProperty({
    description: 'Policy or control that governs the procedure.',
  })
  @Expose()
  policy!: string;

  @ApiProperty({
    description: 'Ordered activities in the procedure.',
    type: () => ProcedureActivityDto,
    isArray: true,
  })
  @Expose()
  activities!: ProcedureActivityDto[];

  @ApiProperty({
    description: 'Inputs required to execute the procedure.',
    type: [String],
  })
  @Expose()
  inputs!: string[];

  @ApiProperty({
    description: 'Outputs produced by the procedure.',
    type: [String],
  })
  @Expose()
  outputs!: string[];

  constructor(partial: Partial<ProcedureResponseDto>) {
    Object.assign(this, partial);
  }
}
