import { PublicGlossaryResponse, PublicGlossaryViewModel } from '../models/public-portal.models';

export function mapGlossaryResponse(response: PublicGlossaryResponse): PublicGlossaryViewModel {
  return {
    terms: response.terms.map((term) => ({
      ...term,
      category: typeof term.category === 'string' ? term.category : null,
    })),
    practices: response.practices,
  };
}
