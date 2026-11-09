import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { WorkflowAuthorizationRepository } from './workflow-authorization.repository';

describe('WorkflowAuthorizationRepository', () => {
  let query: ReturnType<typeof vi.fn>;
  let repository: WorkflowAuthorizationRepository;

  beforeEach(async () => {
    query = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowAuthorizationRepository,
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    repository = module.get<WorkflowAuthorizationRepository>(
      WorkflowAuthorizationRepository,
    );
  });

  it('should resolve team IDs for users, processes, process versions, and procedures', async () => {
    query
      .mockResolvedValueOnce([{ team_id: 'team-1' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ team_id: 'team-2' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ team_id: 'team-3' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ team_id: 'team-4' }])
      .mockResolvedValueOnce([]);

    expect(await repository.findUserTeamId('user-1')).toBe('team-1');
    expect(await repository.findUserTeamId('missing')).toBeNull();
    expect(await repository.findProcessOwnerTeamId('process-1')).toBe('team-2');
    expect(await repository.findProcessOwnerTeamId('missing')).toBeNull();
    expect(await repository.findProcessVersionOwnerTeamId('v1')).toBe('team-3');
    expect(
      await repository.findProcessVersionOwnerTeamId('missing'),
    ).toBeNull();
    expect(await repository.findProcedureOwnerTeamId('proc-1')).toBe('team-4');
    expect(await repository.findProcedureOwnerTeamId('missing')).toBeNull();
  });
});
