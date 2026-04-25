import { Expose } from 'class-transformer';

import type { AuditAction } from '../types/audit-action.type';

export class AuditLogResponseDto {
  @Expose()
  id!: string;

  @Expose()
  entityType!: string;

  @Expose()
  entityId!: string;

  @Expose()
  action!: AuditAction;

  @Expose()
  actorId!: string | null;

  @Expose()
  reasonForChange!: string;

  @Expose()
  oldData!: Record<string, unknown> | null;

  @Expose()
  newData!: Record<string, unknown> | null;

  @Expose()
  createdAt!: Date;

  constructor(partial: Partial<AuditLogResponseDto>) {
    Object.assign(this, partial);
  }
}
