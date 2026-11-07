import type { components, paths } from '../api/generated/api.types';

type JsonResponse<Operation extends { responses: object }> = Operation['responses'] extends {
  200: { content: { 'application/json': infer Response } };
}
  ? Response
  : never;

export type ArchitectureState =
  components['schemas']['PublicProcessSummaryResponseDto']['availableArchitectures'][number];

export type PublicAreaSummary = JsonResponse<paths['/public/areas']['get']>[number];

export type PublicCatalogSearchResult = JsonResponse<paths['/public/search']['get']>[number];

export type PublicProcessSummary = JsonResponse<paths['/public/processes']['get']>[number];

export type PublicProcedureSummary = JsonResponse<paths['/public/procedures']['get']>[number];

export type PublicProcessVersionView = components['schemas']['PublicProcessVersionViewResponseDto'];

export type PublicProcessHistoryItem = JsonResponse<
  paths['/public/processes/{processId}/versions']['get']
>[number];

export type PublicProcessDetail = JsonResponse<paths['/public/processes/{processId}']['get']>;

export type PublicProcedureDetail = JsonResponse<paths['/public/procedures/{id}']['get']>;

export type PublicGlossaryResponse = JsonResponse<paths['/public/glossary']['get']>;
