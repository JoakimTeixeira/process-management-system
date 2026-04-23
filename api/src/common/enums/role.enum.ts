export enum Role {
  EDITOR = 'EDITOR',
  REVIEWER = 'REVIEWER',
  PUBLISHER = 'PUBLISHER',
  VIEWER = 'VIEWER',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

export type GovernanceAction =
  | 'approve'
  | 'reject'
  | 'reopen'
  | 'publish'
  | 'archive'
  | 'promote';

export type GovernanceRole = Exclude<Role, Role.SYSTEM_ADMIN>;

export const GOVERNANCE_ROUTE_ROLE_EXCLUSIONS = {
  approve: [Role.SYSTEM_ADMIN],
  reject: [Role.SYSTEM_ADMIN],
  reopen: [Role.SYSTEM_ADMIN],
  publish: [Role.SYSTEM_ADMIN],
  archive: [Role.SYSTEM_ADMIN],
  promote: [Role.SYSTEM_ADMIN],
} as const satisfies Record<GovernanceAction, readonly Role.SYSTEM_ADMIN[]>;

// SYSTEM_ADMIN is intentionally and explicitly excluded from governance routes.
export const GOVERNANCE_ROUTE_ROLE_ALLOWLISTS = {
  approve: [Role.REVIEWER],
  reject: [Role.REVIEWER],
  reopen: [Role.REVIEWER],
  publish: [Role.PUBLISHER],
  archive: [Role.PUBLISHER],
  promote: [Role.PUBLISHER],
} as const satisfies Record<GovernanceAction, readonly GovernanceRole[]>;

const ROLE_VALUES = [
  Role.EDITOR,
  Role.REVIEWER,
  Role.PUBLISHER,
  Role.VIEWER,
  Role.SYSTEM_ADMIN,
] as const satisfies readonly Role[];

export function isRole(value: string): value is Role {
  return ROLE_VALUES.includes(value as Role);
}

export function parseRole(value: string): Role {
  if (!isRole(value)) {
    throw new Error(`Unsupported role "${value}"`);
  }

  return value;
}
