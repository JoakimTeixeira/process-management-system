export type ArchitectureState = 'AS-IS' | 'TO-BE';

export type PublicProcessFilters = {
  search?: string;
  areaId?: string;
  architectures?: ArchitectureState[];
};

export type PublicProcedureFilters = {
  search?: string;
};

export type PublicCatalogSearchFilters = {
  search?: string;
};

export type PublicAreaSummary = {
  id: string;
  code: string;
  title: string;
};

export type PublicCatalogSearchResult = {
  kind: 'Area' | 'Process' | 'Procedure' | 'Asset';
  code: string;
  title: string;
  subtitle: string;
  href: string;
};

export type PublicProcessSummary = {
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
};

export type PublicProcedureSummary = {
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
};

export type PublicProcessVersionView = {
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
};

export type PublicProcessDetail = {
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
};

export type PublicProcessHistoryItem = {
  id: string;
  versionNumber: number;
  lifecycleState: 'Published' | 'Archived';
  architectureState: ArchitectureState;
  title: string;
  changeDescription: string;
  reasonForChange: string;
  createdAt: string;
  updatedAt: string;
  derivedFromVersionId: string | null;
};

export type PublicProcedureDetail = {
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
};
