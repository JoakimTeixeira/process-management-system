import { mapGlossaryResponse } from './glossary.mapper';

describe('glossary.mapper', () => {
  it('separates glossary terms from practices', () => {
    const response = {
      terms: [
        {
          id: 'term-1',
          term: 'Configuration Item',
          definition: 'Managed component',
          category: 'ITSM',
          isPreferred: true,
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

    expect(mapGlossaryResponse(response)).toEqual(response);
  });
});
