export type AppRole =
  | 'EDITOR'
  | 'REVIEWER'
  | 'PUBLISHER'
  | 'VIEWER'
  | 'SYSTEM_ADMIN';

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  expiresAt: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: AppRole;
  };
  team: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface ItilPractice {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface AreaRecord {
  id: string;
  code: string;
  title: string;
  description: string | null;
  teamId: string;
  teamName: string;
  ownerId: string;
  ownerName: string;
  itilPracticeId: string;
  itilPractice: {
    id: string;
    name: string;
  };
}

export interface GovernanceSummary {
  currentAsIsVersion: {
    id: string;
    versionNumber: number;
    lifecycleState: string;
  } | null;
  currentToBeVersion: {
    id: string;
    versionNumber: number;
    lifecycleState: string;
  } | null;
  activeWorkflowVersion: {
    id: string;
    versionNumber: number;
    architectureState: string;
    lifecycleState: string;
    waitingForRole?: string | null;
    nextAction?: string | null;
  } | null;
  versionCounts: {
    total: number;
    archived: number;
  };
}

export interface ProcessRecord {
  id: string;
  areaId: string;
  code: string;
  title: string;
  description: string | null;
  teamId: string;
  teamName: string;
  ownerId: string;
  ownerName: string;
  governanceSummary?: GovernanceSummary;
}

export interface ProcessVersionRecord {
  id: string;
  processId: string;
  versionNumber: number;
  lifecycleState: 'Draft' | 'In Review' | 'Approved' | 'Published' | 'Archived';
  architectureState: 'AS-IS' | 'TO-BE';
  title: string;
  checklistCompleted: boolean;
  derivedFromVersionId: string | null;
  changeDescription: string;
  reasonForChange: string;
}

export interface ProcedureRecord {
  id: string;
  processVersionId: string;
  processId?: string;
  processCode?: string;
  processTitle?: string;
  versionNumber?: number;
  lifecycleState?: 'Draft' | 'In Review' | 'Approved' | 'Published' | 'Archived';
  architectureState?: 'AS-IS' | 'TO-BE';
  code: string;
  title: string;
  utility: string | null;
  warranty: string | null;
  outcome: string | null;
  policy: string | null;
  activities: Record<string, unknown>[] | null;
  inputs: unknown[] | null;
  outputs: unknown[] | null;
}

export interface AssetRecord {
  id: string;
  processVersionId: string;
  caption: string;
  assetType: string;
  filePath: string;
  mimeType: string;
  checksum: string;
  sizeBytes: number;
  isCurrent: boolean;
  supersededAt: string | null;
  supersededByAssetId: string | null;
  createdAt: string;
}

export interface AssetContentRecord {
  id: string;
  caption: string;
  filePath: string;
  mimeType: string;
  content: string;
}

export interface VersionStateHistoryRecord {
  id: string;
  processVersionId: string;
  fromState: string | null;
  toState: string;
  actorId: string | null;
  actorName: string | null;
  reason: string | null;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string | null;
  actorName: string | null;
  reasonForChange: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  createdAt: string;
}

export interface GlossaryResponse {
  terms: {
    id: string;
    term: string;
    definition: string;
    category: string | null;
    isPreferred: boolean;
  }[];
  practices: ItilPractice[];
}

export interface OwnerOption {
  id: string;
  name: string;
  teamId: string;
  isActive: boolean;
}

export interface TeamOption {
  id: string;
  code: string;
  name: string;
}

export interface TeamRecord extends TeamOption {
  description: string;
  isActive: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: {
    id: string;
    name: AppRole;
  };
  team: TeamOption;
}
