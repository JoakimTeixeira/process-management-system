export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'STATE_CHANGE',
  'APPROVE',
  'REJECT',
  'PUBLISH',
  'ARCHIVE',
  'UPLOAD',
  'SUPERSEDE',
  'PROMOTE',
  'REOPEN',
  'USER_CREATE',
  'USER_UPDATE',
  'USER_DEACTIVATE',
  'ROLE_ASSIGN',
  'TEAM_CHANGE',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];
