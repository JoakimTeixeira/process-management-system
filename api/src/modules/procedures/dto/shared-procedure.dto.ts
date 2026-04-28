import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { trimString } from '../../../common/utils/trim-string-transform.util';

function trimStringArray({ value }: { value: unknown }): unknown {
  return Array.isArray(value)
    ? value.map<unknown>((entry: unknown) =>
        typeof entry === 'string' ? entry.trim() : entry,
      )
    : value;
}

export class ProcedureActivityDto {
  @ApiProperty({
    description: 'Role, team, or resource performing the activity.',
    example: 'Service Desk Analyst',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  resource!: string;

  @ApiProperty({
    description: 'Concrete service action performed in the procedure.',
    example: 'Classify the incident and record impact.',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  serviceAction!: string;

  @ApiProperty({
    description: 'Detailed work instruction for the activity.',
    example: 'Use the incident template and assign the correct priority.',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  workInstruction!: string;
}

export class ProcedureBodyDto {
  @ApiProperty({
    description: 'Procedure title.',
    example: 'Log and Categorize Incident',
    maxLength: MAX_TEXT_LENGTH,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  title!: string;

  @ApiProperty({
    description: 'Utility statement for the procedure.',
    example: 'Ensures incidents are consistently captured and routed.',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  utility!: string;

  @ApiProperty({
    description: 'Warranty statement for the procedure.',
    example: 'Provides traceable and timely intake for every incident.',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  warranty!: string;

  @ApiProperty({
    description: 'Expected business or operational outcome.',
    example:
      'Incidents are prioritized and routed to the right resolver group.',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  outcome!: string;

  @ApiProperty({
    description: 'Policy or control that governs the procedure.',
    example: 'All P1 incidents must be escalated within 15 minutes.',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  policy!: string;

  @ApiProperty({
    description: 'Ordered list of activities executed by the procedure.',
    type: () => ProcedureActivityDto,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProcedureActivityDto)
  activities!: ProcedureActivityDto[];

  @ApiProperty({
    description: 'Inputs required to execute the procedure.',
    type: [String],
    example: ['Incident ticket', 'Affected service details'],
  })
  @Transform(trimStringArray)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  inputs!: string[];

  @ApiProperty({
    description: 'Outputs produced by the procedure.',
    type: [String],
    example: ['Categorized incident', 'Assigned resolver group'],
  })
  @Transform(trimStringArray)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  outputs!: string[];
}
