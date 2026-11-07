import type { Mocked } from 'vitest';

import { GlossaryController } from './glossary.controller';
import type {
  GlossaryService,
  PublicGlossaryResponse,
} from './glossary.service';

describe('GlossaryController', () => {
  it('returns the public glossary payload', async () => {
    const response: PublicGlossaryResponse = {
      terms: [
        {
          id: 'term-1',
          term: 'Configuration Item',
          definition: 'Managed service component',
          category: 'ITSM',
          isPreferred: true,
          createdBy: 'user-1',
        },
      ],
      practices: [
        {
          id: 'practice-1',
          code: 'CHANGE_ENABLEMENT',
          name: 'Change enablement',
          description: 'Controls lifecycle of changes',
        },
      ],
    };
    const service: Mocked<Pick<GlossaryService, 'getPublicGlossary'>> = {
      getPublicGlossary: vi.fn().mockResolvedValue(response),
    };

    const controller = new GlossaryController(
      service as unknown as GlossaryService,
    );

    await expect(controller.getPublicGlossary()).resolves.toEqual(response);
  });
});
