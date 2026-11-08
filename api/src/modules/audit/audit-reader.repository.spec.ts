import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { AuditReaderRepository } from './audit-reader.repository';

describe('AuditReaderRepository', () => {
  let query: ReturnType<typeof vi.fn>;
  let repository: AuditReaderRepository;

  beforeEach(async () => {
    query = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditReaderRepository,
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    repository = module.get<AuditReaderRepository>(AuditReaderRepository);
  });

  it('finds audit logs, state history, and workflow audit access', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    query
      .mockResolvedValueOnce([
        {
          id: 'log-1',
          entity_type: 'area',
          entity_id: 'a1',
          action: 'CREATE',
          actor_id: 'u1',
          actor_name: 'Alice',
          reason_for_change: 'Initial',
          old_data: null,
          new_data: { title: 'Area 1' },
          created_at: now,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'hist-1',
          process_version_id: 'v1',
          from_state: 'Draft',
          to_state: 'In Review',
          actor_id: 'u1',
          actor_name: 'Alice',
          reason: 'Ready',
          created_at: now,
        },
      ])
      .mockResolvedValueOnce([{ entity_exists: true, owner_team_id: 't1' }])
      .mockResolvedValueOnce([]);

    const logs = await repository.findLogsByEntity('area', 'a1');
    expect(logs).toEqual([
      {
        id: 'log-1',
        entityType: 'area',
        entityId: 'a1',
        action: 'CREATE',
        actorId: 'u1',
        actorName: 'Alice',
        reasonForChange: 'Initial',
        oldData: null,
        newData: { title: 'Area 1' },
        createdAt: now,
      },
    ]);

    const history = await repository.findVersionStateHistory('v1');
    expect(history).toEqual([
      {
        id: 'hist-1',
        processVersionId: 'v1',
        fromState: 'Draft',
        toState: 'In Review',
        actorId: 'u1',
        actorName: 'Alice',
        reason: 'Ready',
        createdAt: now,
      },
    ]);

    expect(await repository.findWorkflowAuditAccess('process', 'p1')).toEqual({
      entityExists: true,
      ownerTeamId: 't1',
    });
    expect(
      await repository.findWorkflowAuditAccess('asset', 'missing'),
    ).toEqual({
      entityExists: false,
      ownerTeamId: null,
    });
  });
});
