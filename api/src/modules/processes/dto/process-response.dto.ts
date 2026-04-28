import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class GovernanceVersionSummaryDto {
  @ApiProperty({
    description: 'Unique identifier for the process version.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Human-readable version number.',
    example: 3,
  })
  @Expose()
  versionNumber!: number;

  @ApiProperty({
    description: 'Current lifecycle state of the version.',
    example: 'IN_REVIEW',
  })
  @Expose()
  lifecycleState!: string;
}

class GovernanceActiveWorkflowVersionDto extends GovernanceVersionSummaryDto {
  @ApiProperty({
    description: 'Architecture state of the active workflow version.',
    example: 'TO-BE',
  })
  @Expose()
  architectureState!: string;

  @ApiPropertyOptional({
    description: 'Role currently expected to act on the version.',
    example: 'REVIEWER',
    nullable: true,
  })
  @Expose()
  waitingForRole?: string | null;

  @ApiPropertyOptional({
    description: 'Next governance action available on the workflow.',
    example: 'approve',
    nullable: true,
  })
  @Expose()
  nextAction?: string | null;
}

class GovernanceVersionCountsDto {
  @ApiProperty({
    description: 'Total number of versions for this process.',
    example: 4,
  })
  @Expose()
  total!: number;

  @ApiProperty({
    description: 'Number of archived versions for this process.',
    example: 1,
  })
  @Expose()
  archived!: number;
}

export class GovernanceSummaryDto {
  @ApiProperty({
    description: 'Current approved AS-IS version, if one exists.',
    type: () => GovernanceVersionSummaryDto,
    nullable: true,
  })
  @Expose()
  @Type(() => GovernanceVersionSummaryDto)
  currentAsIsVersion!: GovernanceVersionSummaryDto | null;

  @ApiProperty({
    description: 'Current approved TO-BE version, if one exists.',
    type: () => GovernanceVersionSummaryDto,
    nullable: true,
  })
  @Expose()
  @Type(() => GovernanceVersionSummaryDto)
  currentToBeVersion!: GovernanceVersionSummaryDto | null;

  @ApiProperty({
    description: 'Version that is currently active in the governance workflow.',
    type: () => GovernanceActiveWorkflowVersionDto,
    nullable: true,
  })
  @Expose()
  @Type(() => GovernanceActiveWorkflowVersionDto)
  activeWorkflowVersion!: GovernanceActiveWorkflowVersionDto | null;

  @ApiProperty({
    description: 'Roll-up counts for the process version set.',
    type: () => GovernanceVersionCountsDto,
  })
  @Expose()
  @Type(() => GovernanceVersionCountsDto)
  versionCounts!: GovernanceVersionCountsDto;
}

export class ProcessResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the process.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Parent area UUID for the process.',
    format: 'uuid',
  })
  @Expose()
  areaId!: string;

  @ApiProperty({
    description: 'System-generated process code.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Business-facing title of the process.',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Short description of the process scope.',
    nullable: true,
  })
  @Expose()
  description!: string | null;

  @ApiProperty({
    description: 'Owning team UUID.',
    format: 'uuid',
  })
  @Expose()
  teamId!: string;

  @ApiProperty({
    description: 'Owning team display name.',
  })
  @Expose()
  teamName!: string;

  @ApiProperty({
    description: 'Owner UUID.',
    format: 'uuid',
  })
  @Expose()
  ownerId!: string;

  @ApiProperty({
    description: 'Owner display name.',
  })
  @Expose()
  ownerName!: string;

  @ApiPropertyOptional({
    description: 'Governance roll-up of related process versions.',
    type: () => GovernanceSummaryDto,
  })
  @Expose()
  @Type(() => GovernanceSummaryDto)
  governanceSummary?: GovernanceSummaryDto;

  constructor(partial: Partial<ProcessResponseDto>) {
    Object.assign(this, partial);
  }
}
