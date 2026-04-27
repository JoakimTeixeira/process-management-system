import { PublicGlossaryResponse } from '../models/public-portal.models';

export function mapGlossaryResponse(response: PublicGlossaryResponse) {
  return {
    terms: response.terms,
    practices: response.practices,
  };
}
