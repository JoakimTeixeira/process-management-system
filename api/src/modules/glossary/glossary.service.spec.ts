import type { GlossaryRepository } from './glossary.repository';
import { GlossaryService } from './glossary.service';
import type { AuditLogWriterService } from '../audit/audit-log-writer.service';

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
          createdBy: 'user-1',
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

    const auditLogWriterService: jest.Mocked<
      Pick<AuditLogWriterService, 'create'>
    > = {
      create: jest.fn(),
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
