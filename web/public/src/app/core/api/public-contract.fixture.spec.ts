import type { components } from './generated/api.types';
import type {
  ArchitectureState,
  PublicAreaSummary,
  PublicCatalogSearchResult,
  PublicGlossaryResponse,
  PublicProcessDetail,
  PublicProcessHistoryItem,
  PublicProcessSummary,
  PublicProcessVersionView,
  PublicProcedureDetail,
  PublicProcedureSummary,
} from '../models/public-portal.models';

type IsExact<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
    ? true
    : false;

const aliasesMatchGeneratedComponents: readonly true[] = [
  true as IsExact<
    ArchitectureState,
    components['schemas']['PublicProcessSummaryResponseDto']['availableArchitectures'][number]
  >,
  true as IsExact<PublicAreaSummary, components['schemas']['PublicAreaSummaryResponseDto']>,
  true as IsExact<
    PublicCatalogSearchResult,
    components['schemas']['PublicCatalogSearchResultResponseDto']
  >,
  true as IsExact<PublicProcessSummary, components['schemas']['PublicProcessSummaryResponseDto']>,
  true as IsExact<
    PublicProcedureSummary,
    components['schemas']['PublicProcedureSummaryResponseDto']
  >,
  true as IsExact<
    PublicProcessVersionView,
    components['schemas']['PublicProcessVersionViewResponseDto']
  >,
  true as IsExact<
    PublicProcessHistoryItem,
    components['schemas']['PublicProcessHistoryItemResponseDto']
  >,
  true as IsExact<PublicProcessDetail, components['schemas']['PublicProcessDetailResponseDto']>,
  true as IsExact<PublicProcedureDetail, components['schemas']['PublicProcedureDetailResponseDto']>,
  true as IsExact<PublicGlossaryResponse, components['schemas']['PublicGlossaryResponseDto']>,
];

describe('public contract fixtures', () => {
  it('should keep public model aliases bound to generated OpenAPI components', () => {
    expect(aliasesMatchGeneratedComponents).toEqual(Array(10).fill(true));
  });
});
