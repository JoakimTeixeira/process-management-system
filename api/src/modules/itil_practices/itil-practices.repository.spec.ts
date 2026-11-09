import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { ItilPracticesRepository } from './itil-practices.repository';

describe('ItilPracticesRepository', () => {
  let query: ReturnType<typeof vi.fn>;
  let repository: ItilPracticesRepository;

  const sampleRow = {
    id: 'practice-1',
    code: 'IM',
    name: 'Incident Management',
    description: 'Manage incidents',
  };

  beforeEach(async () => {
    query = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItilPracticesRepository,
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    repository = module.get<ItilPracticesRepository>(ItilPracticesRepository);
  });

  it('should find all practices, by id, by code or name, and create practices', async () => {
    query
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([sampleRow])
      .mockResolvedValueOnce([]);

    expect(await repository.findAll()).toEqual([sampleRow]);
    expect(await repository.findById('practice-1')).toEqual(sampleRow);
    expect(await repository.findById('missing')).toBeNull();
    expect(
      await repository.findByCodeOrName('IM', 'Incident Management'),
    ).toEqual(sampleRow);
    expect(
      await repository.create({
        code: 'IM',
        name: 'Incident Management',
        description: 'Manage incidents',
      }),
    ).toEqual(sampleRow);

    await expect(
      repository.create({
        code: 'EMPTY',
        name: 'Empty',
        description: null,
      }),
    ).rejects.toThrow(TypeError);
  });
});
