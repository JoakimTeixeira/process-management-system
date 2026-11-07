import type { Mocked } from 'vitest';

import type { GlossaryRepository } from './glossary.repository';
import { GlossaryService } from './glossary.service';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';

describe('GlossaryService', () => {
  it('returns glossary terms and practices together', async () => {
    const repository: Mocked<
      Pick<GlossaryRepository, 'listTerms' | 'listPractices'>
    > = {
      listTerms: vi.fn().mockResolvedValue([
        {
          id: 'term-1',
          term: 'Configuration Item',
          definition: 'Managed service component',
          category: 'ITSM',
          isPreferred: true,
          createdBy: 'user-1',
        },
      ]),
      listPractices: vi.fn().mockResolvedValue([
        {
          id: 'practice-1',
          code: 'CHANGE_ENABLEMENT',
          name: 'Change enablement',
          description: 'Controls lifecycle of changes',
        },
      ]),
    };

    const auditLogWriterService: Mocked<Pick<AuditLogWriterService, 'create'>> =
      {
        create: vi.fn(),
      };

    const service = new GlossaryService(
      repository as unknown as GlossaryRepository,
      auditLogWriterService as unknown as AuditLogWriterService,
    );

    await expect(service.getPublicGlossary()).resolves.toEqual({
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
    });
  });
});
