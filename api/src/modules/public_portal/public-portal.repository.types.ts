import type { ArchitectureState } from './public-portal.types';

export interface QueryRow {
  [key: string]: unknown;
}

export interface PublicAreaRow extends QueryRow {
  id: string;
  code: string;
  title: string;
}

export interface PublicProcessSummaryRow extends QueryRow {
  id: string;
  code: string;
  title: string;
  description: string | null;
  area_id: string;
  area_code: string;
  area_title: string;
  practice_id: string;
  practice_code: string;
  practice_name: string;
  available_architectures: ArchitectureState[];
}

export interface PublicProcessVersionRow extends QueryRow {
  id: string;
  process_id: string;
  version_number: number;
  architecture_state: ArchitectureState;
  title: string;
  change_description: string;
  reason_for_change: string;
  asset_id: string | null;
  asset_caption: string | null;
}

export interface PublicProcessVersionHistoryRow extends QueryRow {
  id: string;
  version_number: number;
  lifecycle_state: 'Published' | 'Archived';
  architecture_state: ArchitectureState;
  title: string;
  change_description: string;
  reason_for_change: string;
  created_at: string;
  updated_at: string;
  derived_from_version_id: string | null;
}

export interface PublicProcedureSummaryRow extends QueryRow {
  id: string;
  process_version_id: string;
  code: string;
  title: string;
  utility: string;
  warranty: string;
  outcome: string;
  policy: string;
  activities: Record<string, unknown>[] | null;
  inputs: string[] | null;
  outputs: string[] | null;
  process_id: string;
  process_code: string;
  process_title: string;
  area_id: string;
  area_code: string;
  area_title: string;
  practice_id: string;
  practice_code: string;
  practice_name: string;
  version_number: number;
  architecture_state: ArchitectureState;
  version_title: string;
}

export interface PublicBpmnAssetRow extends QueryRow {
  file_path: string;
}

export interface PublicCatalogSearchRow extends QueryRow {
  kind: 'Area' | 'Process' | 'Procedure' | 'Asset';
  code: string;
  title: string;
  subtitle: string;
  href: string;
  sort_kind: number;
  sort_title: string;
  similarity_score: number;
}
