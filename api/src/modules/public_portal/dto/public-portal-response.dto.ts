import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const architectureStates = ['AS-IS', 'TO-BE'] as const;
const catalogKinds = ['Area', 'Process', 'Procedure', 'Asset'] as const;
const lifecycleStates = ['Published', 'Archived'] as const;

class PublicItilPracticeSummaryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the linked ITIL practice.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Short ITIL practice reference code.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Display name for the linked ITIL practice.',
  })
  @Expose()
  name!: string;
}

class PublicProcessReferenceResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the published process.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Short process reference code.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Display title for the process.',
  })
  @Expose()
  title!: string;
}

class PublicProcedureVersionSummaryResponseDto {
  @ApiProperty({
    description: 'Published version number for the procedure.',
    example: 3,
  })
  @Expose()
  versionNumber!: number;

  @ApiProperty({
    description: 'Architecture state for the linked published version.',
    enum: architectureStates,
  })
  @Expose()
  architectureState!: (typeof architectureStates)[number];

  @ApiProperty({
    description: 'Display title for the linked published version.',
  })
  @Expose()
  title!: string;
}

class PublicProcessVersionDetailResponseDto extends PublicProcedureVersionSummaryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the published process version.',
    format: 'uuid',
  })
  @Expose()
  id!: string;
}

class PublicBpmnAssetSummaryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the published BPMN asset.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Caption shown for the BPMN asset.',
  })
  @Expose()
  caption!: string;
}

export class PublicAreaSummaryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the public area.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Short area reference code.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Display title for the area.',
  })
  @Expose()
  title!: string;

  constructor(partial: Partial<PublicAreaSummaryResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PublicCatalogSearchResultResponseDto {
  @ApiProperty({
    description: 'Catalog entity type matched by the search query.',
    enum: catalogKinds,
  })
  @Expose()
  kind!: (typeof catalogKinds)[number];

  @ApiProperty({
    description: 'Matched catalogue code.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Matched catalogue title.',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Supporting context displayed with the result.',
  })
  @Expose()
  subtitle!: string;

  @ApiProperty({
    description: 'Public portal link for the matched item.',
    example: '/catalog/processes?areaId=4b9581f2-ff64-4acf-9d40-0b2f7b13b0ea',
  })
  @Expose()
  href!: string;

  constructor(partial: Partial<PublicCatalogSearchResultResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PublicProcessSummaryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the published process.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Short process reference code.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Display title for the process.',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Short description of the published process.',
    nullable: true,
  })
  @Expose()
  description!: string | null;

  @ApiProperty({
    description: 'Owning area summary for the published process.',
    type: () => PublicAreaSummaryResponseDto,
  })
  @Expose()
  @Type(() => PublicAreaSummaryResponseDto)
  area!: PublicAreaSummaryResponseDto;

  @ApiProperty({
    description: 'Linked ITIL practice summary.',
    type: () => PublicItilPracticeSummaryResponseDto,
  })
  @Expose()
  @Type(() => PublicItilPracticeSummaryResponseDto)
  itilPractice!: PublicItilPracticeSummaryResponseDto;

  @ApiProperty({
    description: 'Published architecture states currently available.',
    enum: architectureStates,
    isArray: true,
  })
  @Expose()
  availableArchitectures!: Array<(typeof architectureStates)[number]>;

  constructor(partial: Partial<PublicProcessSummaryResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PublicProcedureSummaryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the published procedure.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Unique identifier for the published process version.',
    format: 'uuid',
  })
  @Expose()
  processVersionId!: string;

  @ApiProperty({
    description: 'Short procedure reference code.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Display title for the procedure.',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Short description of the published procedure.',
    nullable: true,
  })
  @Expose()
  description!: string | null;

  @ApiProperty({
    description: 'Published version summary for the procedure.',
    type: () => PublicProcedureVersionSummaryResponseDto,
  })
  @Expose()
  @Type(() => PublicProcedureVersionSummaryResponseDto)
  version!: PublicProcedureVersionSummaryResponseDto;

  @ApiProperty({
    description: 'Parent process summary for the procedure.',
    type: () => PublicProcessReferenceResponseDto,
  })
  @Expose()
  @Type(() => PublicProcessReferenceResponseDto)
  process!: PublicProcessReferenceResponseDto;

  @ApiProperty({
    description: 'Owning area summary for the procedure.',
    type: () => PublicAreaSummaryResponseDto,
  })
  @Expose()
  @Type(() => PublicAreaSummaryResponseDto)
  area!: PublicAreaSummaryResponseDto;

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
    description: 'Outcome statement for the procedure.',
  })
  @Expose()
  outcome!: string;

  @ApiProperty({
    description: 'Policy statement for the procedure.',
  })
  @Expose()
  policy!: string;

  @ApiProperty({
    description: 'Structured activity definitions for the procedure.',
    type: () => Object,
    isArray: true,
  })
  @Expose()
  activities!: Record<string, unknown>[];

  @ApiProperty({
    description: 'Inputs required by the procedure.',
    type: String,
    isArray: true,
  })
  @Expose()
  inputs!: string[];

  @ApiProperty({
    description: 'Outputs produced by the procedure.',
    type: String,
    isArray: true,
  })
  @Expose()
  outputs!: string[];

  constructor(partial: Partial<PublicProcedureSummaryResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PublicProcessVersionViewResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the published process version.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Parent process identifier.',
    format: 'uuid',
  })
  @Expose()
  processId!: string;

  @ApiProperty({
    description: 'Human-readable published version number.',
    example: 2,
  })
  @Expose()
  versionNumber!: number;

  @ApiProperty({
    description: 'Architecture state for the published process version.',
    enum: architectureStates,
  })
  @Expose()
  architectureState!: (typeof architectureStates)[number];

  @ApiProperty({
    description: 'Display title for the published process version.',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Summary of what changed in the version.',
  })
  @Expose()
  changeDescription!: string;

  @ApiProperty({
    description: 'Reason the change was introduced.',
  })
  @Expose()
  reasonForChange!: string;

  @ApiProperty({
    description: 'Published procedures attached to the version.',
    type: () => PublicProcedureSummaryResponseDto,
    isArray: true,
  })
  @Expose()
  @Type(() => PublicProcedureSummaryResponseDto)
  procedures!: PublicProcedureSummaryResponseDto[];

  @ApiProperty({
    description: 'Published BPMN asset for the version, if available.',
    type: () => PublicBpmnAssetSummaryResponseDto,
    nullable: true,
  })
  @Expose()
  @Type(() => PublicBpmnAssetSummaryResponseDto)
  bpmnAsset!: PublicBpmnAssetSummaryResponseDto | null;

  constructor(partial: Partial<PublicProcessVersionViewResponseDto>) {
    Object.assign(this, partial);
  }
}

class PublicProcessDetailProcessResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the published process.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Short process reference code.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Display title for the process.',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Short description of the published process.',
    nullable: true,
  })
  @Expose()
  description!: string | null;

  @ApiProperty({
    description: 'Owning area summary for the process.',
    type: () => PublicAreaSummaryResponseDto,
  })
  @Expose()
  @Type(() => PublicAreaSummaryResponseDto)
  area!: PublicAreaSummaryResponseDto;

  @ApiProperty({
    description: 'Linked ITIL practice summary.',
    type: () => PublicItilPracticeSummaryResponseDto,
  })
  @Expose()
  @Type(() => PublicItilPracticeSummaryResponseDto)
  itilPractice!: PublicItilPracticeSummaryResponseDto;
}

class PublicProcessVersionsResponseDto {
  @ApiProperty({
    description: 'Current published AS-IS version, if one exists.',
    type: () => PublicProcessVersionViewResponseDto,
    nullable: true,
  })
  @Expose()
  @Type(() => PublicProcessVersionViewResponseDto)
  asIs!: PublicProcessVersionViewResponseDto | null;

  @ApiProperty({
    description: 'Current published TO-BE version, if one exists.',
    type: () => PublicProcessVersionViewResponseDto,
    nullable: true,
  })
  @Expose()
  @Type(() => PublicProcessVersionViewResponseDto)
  toBe!: PublicProcessVersionViewResponseDto | null;
}

export class PublicProcessDetailResponseDto {
  @ApiProperty({
    description: 'Published process summary and catalogue metadata.',
    type: () => PublicProcessDetailProcessResponseDto,
  })
  @Expose()
  @Type(() => PublicProcessDetailProcessResponseDto)
  process!: PublicProcessDetailProcessResponseDto;

  @ApiProperty({
    description: 'Published versions currently exposed for the process.',
    type: () => PublicProcessVersionsResponseDto,
  })
  @Expose()
  @Type(() => PublicProcessVersionsResponseDto)
  versions!: PublicProcessVersionsResponseDto;

  constructor(partial: Partial<PublicProcessDetailResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PublicProcessHistoryItemResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the published process version.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Human-readable published version number.',
    example: 4,
  })
  @Expose()
  versionNumber!: number;

  @ApiProperty({
    description: 'Lifecycle state currently visible in the public catalogue.',
    enum: lifecycleStates,
  })
  @Expose()
  lifecycleState!: (typeof lifecycleStates)[number];

  @ApiProperty({
    description: 'Architecture state for the published process version.',
    enum: architectureStates,
  })
  @Expose()
  architectureState!: (typeof architectureStates)[number];

  @ApiProperty({
    description: 'Display title for the published process version.',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Summary of what changed in the version.',
  })
  @Expose()
  changeDescription!: string;

  @ApiProperty({
    description: 'Reason the change was introduced.',
  })
  @Expose()
  reasonForChange!: string;

  @ApiProperty({
    description: 'Timestamp when the version was created.',
    format: 'date-time',
  })
  @Expose()
  createdAt!: string;

  @ApiProperty({
    description: 'Timestamp when the version was last updated.',
    format: 'date-time',
  })
  @Expose()
  updatedAt!: string;

  @ApiProperty({
    description: 'Identifier of the source version this one was derived from.',
    format: 'uuid',
    nullable: true,
  })
  @Expose()
  derivedFromVersionId!: string | null;

  constructor(partial: Partial<PublicProcessHistoryItemResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PublicProcedureDetailResponseDto {
  @ApiProperty({
    description: 'Published procedure content.',
    type: () => PublicProcedureSummaryResponseDto,
  })
  @Expose()
  @Type(() => PublicProcedureSummaryResponseDto)
  procedure!: PublicProcedureSummaryResponseDto;

  @ApiProperty({
    description: 'Published version that owns the procedure.',
    type: () => PublicProcessVersionDetailResponseDto,
  })
  @Expose()
  @Type(() => PublicProcessVersionDetailResponseDto)
  version!: PublicProcessVersionDetailResponseDto;

  @ApiProperty({
    description: 'Parent process summary for the procedure.',
    type: () => PublicProcessReferenceResponseDto,
  })
  @Expose()
  @Type(() => PublicProcessReferenceResponseDto)
  process!: PublicProcessReferenceResponseDto;

  @ApiProperty({
    description: 'Owning area summary for the procedure.',
    type: () => PublicAreaSummaryResponseDto,
  })
  @Expose()
  @Type(() => PublicAreaSummaryResponseDto)
  area!: PublicAreaSummaryResponseDto;

  @ApiProperty({
    description: 'Linked ITIL practice summary.',
    type: () => PublicItilPracticeSummaryResponseDto,
  })
  @Expose()
  @Type(() => PublicItilPracticeSummaryResponseDto)
  itilPractice!: PublicItilPracticeSummaryResponseDto;

  constructor(partial: Partial<PublicProcedureDetailResponseDto>) {
    Object.assign(this, partial);
  }
}
