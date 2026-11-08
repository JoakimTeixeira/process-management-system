import type { Mock } from 'vitest';

import type { DataSource } from 'typeorm';

import { GlossaryRepository } from './glossary.repository';

describe('GlossaryRepository', () => {
  let query: Mock;
  let repository: GlossaryRepository;

  beforeEach(() => {
    query = vi.fn();

    repository = new GlossaryRepository({ query } as unknown as DataSource);
  });

  it('maps INSERT ... RETURNING results when TypeORM returns [rows, rowCount]', async () => {
    query.mockResolvedValue([
      [
        {
          id: 'term-1',
          term: 'AS-IS',
          definition: 'Current state',
          category: 'Architecture State',
          is_preferred: false,
          created_by: 'user-1',
        },
      ],
      1,
    ]);

    await expect(
      repository.create({
        term: 'AS-IS',
        definition: 'Current state',
        category: 'Architecture State',
        isPreferred: false,
        createdBy: 'user-1',
      }),
    ).resolves.toEqual({
      id: 'term-1',
      term: 'AS-IS',
      definition: 'Current state',
      category: 'Architecture State',
      isPreferred: false,
      createdBy: 'user-1',
    });
  });

  it('maps UPDATE ... RETURNING results when TypeORM returns [rows, rowCount]', async () => {
    query.mockResolvedValue([
      [
        {
          id: 'term-1',
          term: 'AS-IS',
          definition: 'Current officially published state',
          category: 'Architecture State',
          is_preferred: false,
          created_by: 'user-1',
        },
      ],
      1,
    ]);

    await expect(
      repository.update('term-1', {
        definition: 'Current officially published state',
      }),
    ).resolves.toEqual({
      id: 'term-1',
      term: 'AS-IS',
      definition: 'Current officially published state',
      category: 'Architecture State',
      isPreferred: false,
      createdBy: 'user-1',
    });
  });
});
