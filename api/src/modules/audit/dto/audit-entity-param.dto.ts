import { IsIn, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const AUDIT_ENTITY_TYPES = [
  'area',
  'process',
  'process_version',
  'procedure',
  'asset',
  'user',
  'role',
  'team',
] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export class AuditEntityParamDto {
  @ApiProperty({
    description: 'Entity type to query in the audit log.',
    enum: AUDIT_ENTITY_TYPES,
  })
  @IsIn(AUDIT_ENTITY_TYPES)
  entityType!: AuditEntityType;

  @ApiProperty({
    description: 'Unique identifier for the audited entity.',
    format: 'uuid',
  })
  @IsUUID()
  entityId!: string;
}
