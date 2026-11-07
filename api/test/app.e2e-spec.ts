import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import type { Mock } from 'vitest';

import { AppModule } from './../src/app.module';

describe('Application health (e2e)', () => {
  let app: INestApplication<App>;
  let query: Mock;

  beforeEach(async () => {
    query = vi.fn().mockResolvedValue([{ '?column?': 1 }]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getDataSourceToken())
      .useValue({ query })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('bootstraps the application and serves GET /health', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({
        status: 'UP',
        checks: {
          database: 'UP',
        },
      });

    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  afterEach(async () => {
    await app.close();
  });
});
