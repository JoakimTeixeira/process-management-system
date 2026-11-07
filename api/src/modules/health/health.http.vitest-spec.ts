import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import type { Express } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('Health endpoint (Vitest pilot)', () => {
  const query = vi.fn<(sql: string) => Promise<unknown[]>>();

  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    expect(query).not.toHaveBeenCalled();
    expect(query.getMockImplementation()).toBeUndefined();

    moduleFixture = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: getDataSourceToken(),
          useValue: { query },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();

    query.mockResolvedValue([{ leaked: true }]);
    await query('SELECT leaked test state');
  });

  it('resolves decorated controller and service dependencies', () => {
    expect(Reflect.getMetadata('design:paramtypes', HealthController)).toEqual([
      HealthService,
    ]);
    expect(moduleFixture.get(HealthController)).toBeInstanceOf(
      HealthController,
    );
    expect(moduleFixture.get(HealthService)).toBeInstanceOf(HealthService);
  });

  it('returns 200 when the database is up', async () => {
    query.mockResolvedValue([{ '?column?': 1 }]);

    await request(app.getHttpServer() as Express)
      .get('/health')
      .expect(200)
      .expect({
        status: 'UP',
        checks: {
          database: 'UP',
        },
      });
  });

  it('returns 503 when the database is down', async () => {
    query.mockRejectedValue(new Error('connection failed'));

    await request(app.getHttpServer() as Express)
      .get('/health')
      .expect(503)
      .expect({
        status: 'DOWN',
        checks: {
          database: 'DOWN',
        },
      });
  });
});
