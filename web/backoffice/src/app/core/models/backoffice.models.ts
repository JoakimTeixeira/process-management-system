import type { components, paths } from '../api/generated/api.types';

type ApiSchemas = components['schemas'];
type Replace<T, Replacement> = Omit<T, keyof Replacement> & Replacement;

export type AppRole = NonNullable<ApiSchemas['CreateUserDto']['roleName']>;
export type LifecycleState = ApiSchemas['ProcessVersionResponseDto']['lifecycleState'];
export type ArchitectureState = ApiSchemas['ProcessVersionResponseDto']['architectureState'];

export type LoginResponse = ApiSchemas['LoginResponseDto'];

type CurrentUserContract = ApiSchemas['MeResponseDto'];
export type CurrentUser = Omit<CurrentUserContract, 'role'> & {
  role: Omit<CurrentUserContract['role'], 'name'> & { name: AppRole };
};

export type ItilPractice = Replace<
  ApiSchemas['ItilPracticeResponseDto'],
  { description: string | null }
>;
export type AreaRecord = Replace<ApiSchemas['AreaResponseDto'], { description: string | null }>;

type GovernanceActiveWorkflowVersion = Replace<
  ApiSchemas['GovernanceActiveWorkflowVersionDto'],
  { waitingForRole?: string | null; nextAction?: string | null }
>;
export type GovernanceSummary = Replace<
  ApiSchemas['GovernanceSummaryDto'],
  { activeWorkflowVersion: GovernanceActiveWorkflowVersion | null }
>;
export type ProcessRecord = Replace<
  ApiSchemas['ProcessResponseDto'],
  { description: string | null; governanceSummary?: GovernanceSummary }
>;
export type ProcessVersionRecord = Replace<
  ApiSchemas['ProcessVersionResponseDto'],
  { derivedFromVersionId: string | null }
>;
export type ProcedureRecord = Replace<
  ApiSchemas['ProcedureResponseDto'],
  {
    utility: string | null;
    warranty: string | null;
    outcome: string | null;
    policy: string | null;
    activities: Record<string, unknown>[] | null;
    inputs: unknown[] | null;
    outputs: unknown[] | null;
  }
>;
export type AssetRecord = Replace<
  ApiSchemas['AssetResponseDto'],
  { supersededAt: string | null; supersededByAssetId: string | null }
>;
export type AssetContentRecord = ApiSchemas['AssetContentResponseDto'];
export type VersionStateHistoryRecord = Replace<
  ApiSchemas['VersionStateHistoryResponseDto'],
  { actorId: string | null; actorName: string | null; reason: string | null }
>;
export type AuditLogRecord = Replace<
  ApiSchemas['AuditLogResponseDto'],
  { actorId: string | null; actorName: string | null }
>;
export type GlossaryTermRecord = Replace<
  ApiSchemas['GlossaryTermResponseDto'],
  { category: string | null; createdBy: string | null }
>;
export type GlossaryResponse = Replace<
  ApiSchemas['PublicGlossaryResponseDto'],
  { terms: GlossaryTermRecord[] }
>;
export type CreateGlossaryTermPayload = Replace<
  ApiSchemas['CreateGlossaryTermDto'],
  { category?: string | null }
>;
export type UpdateGlossaryTermPayload = Replace<
  ApiSchemas['UpdateGlossaryTermDto'],
  { category?: string | null }
>;
export type CreateGlossaryTermResponse = Replace<
  paths['/glossary']['post']['responses'][201]['content']['application/json'],
  GlossaryTermRecord
>;
export type UpdateGlossaryTermResponse = Replace<
  paths['/glossary/{id}']['patch']['responses'][200]['content']['application/json'],
  GlossaryTermRecord
>;
export type OwnerOption = ApiSchemas['OwnerOptionResponseDto'];
export type TeamOption = ApiSchemas['TeamOptionResponseDto'];
export type TeamRecord = ApiSchemas['TeamResponseDto'];

type AdminUserContract = ApiSchemas['UserResponseDto'];
export type AdminUser = Omit<AdminUserContract, 'role'> & {
  role: Omit<AdminUserContract['role'], 'name'> & { name: AppRole };
};
