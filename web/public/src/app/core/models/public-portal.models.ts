export type ArchitectureState = 'AS-IS' | 'TO-BE';

export interface PublicAreaSummary {
  id: string;
  code: string;
  title: string;
}

export interface PublicCatalogSearchResult {
  kind: 'Area' | 'Process' | 'Procedure' | 'Asset';
  code: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface PublicProcessSummary {
  id: string;
  code: string;
  title: string;
  description: string | null;
  area: PublicAreaSummary;
  itilPractice: {
    id: string;
    code: string;
    name: string;
  };
  availableArchitectures: ArchitectureState[];
}

export interface PublicProcedureSummary {
  id: string;
  processVersionId: string;
  code: string;
  title: string;
  description: string | null;
  version: {
    versionNumber: number;
    architectureState: ArchitectureState;
    title: string;
  };
  process: {
    id: string;
    code: string;
    title: string;
  };
  area: PublicAreaSummary;
  utility: string;
  warranty: string;
  outcome: string;
  policy: string;
  activities: Record<string, unknown>[];
  inputs: string[];
  outputs: string[];
}

export interface PublicProcessVersionView {
  id: string;
  processId: string;
  versionNumber: number;
  architectureState: ArchitectureState;
  title: string;
  changeDescription: string;
  reasonForChange: string;
  procedures: PublicProcedureSummary[];
  bpmnAsset: {
    id: string;
    caption: string;
  } | null;
}

export interface PublicProcessHistoryItem {
  id: string;
  versionNumber: number;
  lifecycleState: 'Published' | 'Archived';
  architectureState: ArchitectureState;
  title: string;
  changeDescription: string;
  reasonForChange: string;
  createdAt?: string;
  updatedAt?: string;
  derivedFromVersionId?: string | null;
}

export interface PublicProcessDetail {
  process: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    area: PublicAreaSummary;
    itilPractice: {
      id: string;
      code: string;
      name: string;
    };
  };
  versions: {
    asIs: PublicProcessVersionView | null;
    toBe: PublicProcessVersionView | null;
  };
}

export interface PublicProcedureDetail {
  procedure: PublicProcedureSummary;
  version: {
    id: string;
    versionNumber: number;
    architectureState: ArchitectureState;
    title: string;
  };
  process: {
    id: string;
    code: string;
    title: string;
  };
  area: PublicAreaSummary;
  itilPractice: {
    id: string;
    code: string;
    name: string;
  };
}

export interface PublicGlossaryResponse {
  terms: {
    id: string;
    term: string;
    definition: string;
    category: string | null;
    isPreferred: boolean;
  }[];
  practices: {
    id: string;
    code: string;
    name: string;
    description: string;
  }[];
}
