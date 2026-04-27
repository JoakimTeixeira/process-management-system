import type { GlossaryRepository } from './glossary.repository';
import { GlossaryService } from './glossary.service';

describe('GlossaryService', () => {
  it('returns glossary terms and practices together', async () => {
    const repository: jest.Mocked<
      Pick<GlossaryRepository, 'listTerms' | 'listPractices'>
    > = {
      listTerms: jest.fn().mockResolvedValue([
        {
          id: 'term-1',
          term: 'Configuration Item',
          definition: 'Managed service component',
          category: 'ITSM',
          isPreferred: true,
        },
      ]),
      listPractices: jest.fn().mockResolvedValue([
        {
          id: 'practice-1',
          code: 'CHANGE_ENABLEMENT',
          name: 'Change enablement',
          description: 'Controls lifecycle of changes',
        },
      ]),
    };

    const service = new GlossaryService(
      repository as unknown as GlossaryRepository,
    );

    await expect(service.getPublicGlossary()).resolves.toEqual({
      terms: [
        {
          id: 'term-1',
          term: 'Configuration Item',
          definition: 'Managed service component',
          category: 'ITSM',
          isPreferred: true,
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
    });
  });
});
