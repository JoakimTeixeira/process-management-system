import { IsIn, IsUUID } from 'class-validator';

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
  @IsIn(AUDIT_ENTITY_TYPES)
  entityType!: AuditEntityType;

  @IsUUID()
  entityId!: string;
}
