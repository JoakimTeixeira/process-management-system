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

export type ItilPractice = ApiSchemas['ItilPracticeResponseDto'];
export type AreaRecord = ApiSchemas['AreaResponseDto'];
export type GovernanceSummary = ApiSchemas['GovernanceSummaryDto'];
export type ProcessRecord = ApiSchemas['ProcessResponseDto'];
export type ProcessVersionRecord = ApiSchemas['ProcessVersionResponseDto'];
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
export type AssetRecord = ApiSchemas['AssetResponseDto'];
export type AssetContentRecord = ApiSchemas['AssetContentResponseDto'];
export type VersionStateHistoryRecord = ApiSchemas['VersionStateHistoryResponseDto'];
export type AuditLogRecord = ApiSchemas['AuditLogResponseDto'];
export type GlossaryTermRecord = ApiSchemas['GlossaryTermResponseDto'];
export type GlossaryResponse = ApiSchemas['PublicGlossaryResponseDto'];
export type CreateGlossaryTermPayload = ApiSchemas['CreateGlossaryTermDto'];
export type UpdateGlossaryTermPayload = ApiSchemas['UpdateGlossaryTermDto'];
export type CreateGlossaryTermResponse =
  paths['/glossary']['post']['responses'][201]['content']['application/json'];
export type UpdateGlossaryTermResponse =
  paths['/glossary/{id}']['patch']['responses'][200]['content']['application/json'];
export type OwnerOption = ApiSchemas['OwnerOptionResponseDto'];
export type TeamOption = ApiSchemas['TeamOptionResponseDto'];
export type TeamRecord = ApiSchemas['TeamResponseDto'];

type AdminUserContract = ApiSchemas['UserResponseDto'];
export type AdminUser = Omit<AdminUserContract, 'role'> & {
  role: Omit<AdminUserContract['role'], 'name'> & { name: AppRole };
};
