import type { AuditAction } from '../types/audit-action.type';

export interface CreateAuditLogEntry {
  entityType: string;
  entityId: string;
  action: AuditAction;
  actorId: string;
  reasonForChange: string | null;
  oldData?: object | null;
  newData?: object | null;
}
