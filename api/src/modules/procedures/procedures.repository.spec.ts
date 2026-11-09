import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { ProceduresRepository } from './procedures.repository';

describe('ProceduresRepository', () => {
  let query: ReturnType<typeof vi.fn>;
  let repository: ProceduresRepository;

  const sampleRow = {
    id: 'proc-1',
    process_version_id: 'v1',
    process_id: 'p1',
    process_code: '1',
    process_title: 'Incident Management',
    version_number: 1,
    lifecycle_state: 'Draft',
    architecture_state: 'AS-IS',
    code: '1.1',
    title: 'Log Incident',
    utility: 'Capture',
    warranty: 'Always',
    outcome: 'Logged',
    policy: 'Mandatory',
    activities: [
      { resource: 'Agent', serviceAction: 'Log', workInstruction: 'Open form' },
    ],
    inputs: ['Alert'],
    outputs: ['Ticket'],
  };

  beforeEach(async () => {
    query = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProceduresRepository,
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    repository = module.get<ProceduresRepository>(ProceduresRepository);
  });

  it('should find procedures by id, version, backoffice list, and code', async () => {
    query
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([]);

    expect(await repository.findById('proc-1')).toMatchObject({
      id: 'proc-1',
      code: '1.1',
    });
    expect(await repository.findById('missing')).toBeNull();
    expect(await repository.findByProcessVersionId('v1')).toHaveLength(1);
    expect(await repository.findAllForBackoffice()).toHaveLength(1);
    expect(await repository.findByVersionAndCode('v1', '1.1')).toMatchObject({
      id: 'proc-1',
    });
    expect(await repository.findByVersionAndCode('v1', '9.9')).toBeNull();
  });

  it('should compute the next procedure code and reject missing process codes', async () => {
    query
      .mockResolvedValueOnce([{ process_code: '1', max_suffix: 2 }])
      .mockResolvedValueOnce([{ process_code: '1', max_suffix: null }])
      .mockResolvedValueOnce([]);

    expect(await repository.getNextProcedureCode('v1')).toBe('1.3');
    expect(await repository.getNextProcedureCode('v1')).toBe('1.1');
    await expect(repository.getNextProcedureCode('missing')).rejects.toThrow(
      TypeError,
    );
  });

  it('should create, update, and deletes procedures and validate required records', async () => {
    query
      .mockResolvedValueOnce([{ id: 'proc-1' }])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([]);

    const created = await repository.create({
      processVersionId: 'v1',
      code: '1.1',
      title: 'Log Incident',
      utility: 'Capture',
      warranty: 'Always',
      outcome: 'Logged',
      policy: 'Mandatory',
      activities: [],
      inputs: [],
      outputs: [],
      actorId: 'user-1',
    });
    expect(created.id).toBe('proc-1');

    const updated = await repository.update(
      'proc-1',
      {
        title: 'Updated',
        utility: 'Updated',
        warranty: 'Updated',
        outcome: 'Updated',
        policy: 'Updated',
        activities: [],
        inputs: ['In'],
        outputs: ['Out'],
      },
      'user-1',
    );
    expect(updated.id).toBe('proc-1');

    await repository.delete('proc-1');

    query.mockResolvedValueOnce([]);
    await expect(
      repository.create({
        processVersionId: 'v1',
        code: '1.2',
        title: 'No ID',
        utility: 'U',
        warranty: 'W',
        outcome: 'O',
        policy: 'P',
        activities: [],
        inputs: [],
        outputs: [],
        actorId: 'user-1',
      }),
    ).rejects.toThrow(TypeError);
  });
});
