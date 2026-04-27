import type {
  PublicAreaRow,
  PublicCatalogSearchRow,
  PublicProcessSummaryRow,
  PublicProcessVersionHistoryRow,
  PublicProcessVersionRow,
  PublicProcedureSummaryRow,
} from './public-portal.repository.types';
import type {
  PublicAreaSummary,
  PublicCatalogSearchResult,
  PublicProcessDetail,
  PublicProcessHistoryItem,
  PublicProcessSummary,
  PublicProcessVersionView,
  PublicProcedureDetail,
  PublicProcedureSummary,
} from './public-portal.types';

function mapArea(
  row: PublicProcessSummaryRow | PublicProcedureSummaryRow,
): PublicAreaSummary {
  return {
    id: row.area_id,
    code: row.area_code,
    title: row.area_title,
  };
}

function mapItilPractice(
  row: PublicProcessSummaryRow | PublicProcedureSummaryRow,
) {
  return {
    id: row.practice_id,
    code: row.practice_code,
    name: row.practice_name,
  };
}

export function mapAreaSummary(row: PublicAreaRow): PublicAreaSummary {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
  };
}

export function mapCatalogSearchResult(
  row: PublicCatalogSearchRow,
): PublicCatalogSearchResult {
  return {
    kind: row.kind,
    code: row.code,
    title: row.title,
    subtitle: row.subtitle,
    href: row.href,
  };
}

export function mapProcessSummary(
  row: PublicProcessSummaryRow,
): PublicProcessSummary {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    area: {
      id: row.area_id,
      code: row.area_code,
      title: row.area_title,
    },
    itilPractice: mapItilPractice(row),
    availableArchitectures: row.available_architectures ?? [],
  };
}

export function mapProcedureSummary(
  row: PublicProcedureSummaryRow,
): PublicProcedureSummary {
  return {
    id: row.id,
    processVersionId: row.process_version_id,
    code: row.code,
    title: row.title,
    description: null,
    version: {
      versionNumber: row.version_number,
      architectureState: row.architecture_state,
      title: row.version_title,
    },
    process: {
      id: row.process_id,
      code: row.process_code,
      title: row.process_title,
    },
    area: mapArea(row),
    utility: row.utility,
    warranty: row.warranty,
    outcome: row.outcome,
    policy: row.policy,
    activities: row.activities ?? [],
    inputs: row.inputs ?? [],
    outputs: row.outputs ?? [],
  };
}

export function mapProcessVersionView(
  row: PublicProcessVersionRow,
  procedures: PublicProcedureSummary[],
): PublicProcessVersionView {
  return {
    id: row.id,
    processId: row.process_id,
    versionNumber: row.version_number,
    architectureState: row.architecture_state,
    title: row.title,
    changeDescription: row.change_description,
    reasonForChange: row.reason_for_change,
    procedures,
    bpmnAsset:
      row.asset_id && row.asset_caption
        ? {
            id: row.asset_id,
            caption: row.asset_caption,
          }
        : null,
  };
}

export function mapProcessDetail(
  row: PublicProcessSummaryRow,
  versions: PublicProcessDetail['versions'],
): PublicProcessDetail {
  return {
    process: {
      id: row.id,
      code: row.code,
      title: row.title,
      description: row.description,
      area: mapArea(row),
      itilPractice: mapItilPractice(row),
    },
    versions,
  };
}

export function mapProcessHistoryItem(
  row: PublicProcessVersionHistoryRow,
): PublicProcessHistoryItem {
  return {
    id: row.id,
    versionNumber: row.version_number,
    lifecycleState: row.lifecycle_state,
    architectureState: row.architecture_state,
    title: row.title,
    changeDescription: row.change_description,
    reasonForChange: row.reason_for_change,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    derivedFromVersionId: row.derived_from_version_id,
  };
}

export function mapProcedureDetail(
  row: PublicProcedureSummaryRow,
): PublicProcedureDetail {
  return {
    procedure: mapProcedureSummary(row),
    version: {
      id: row.process_version_id,
      versionNumber: row.version_number,
      architectureState: row.architecture_state,
      title: row.version_title,
    },
    process: {
      id: row.process_id,
      code: row.process_code,
      title: row.process_title,
    },
    area: mapArea(row),
    itilPractice: mapItilPractice(row),
  };
}
