import { PublicGlossaryResponse } from '../models/public-portal.models';
import { mapGlossaryResponse } from './glossary.mapper';

describe('glossary.mapper', () => {
  it('should separate glossary terms from practices', () => {
    const response: PublicGlossaryResponse = {
      terms: [
        {
          id: 'term-1',
          term: 'Configuration Item',
          definition: 'Managed component',
          category: {},
          isPreferred: true,
          createdBy: null,
        },
      ],
      practices: [
        {
          id: 'practice-1',
          code: 'CHANGE_ENABLEMENT',
          name: 'Change enablement',
          description: 'Controls changes',
        },
      ],
    };

    expect(mapGlossaryResponse(response)).toEqual({
      ...response,
      terms: [{ ...response.terms[0], category: null }],
    });
  });
});
