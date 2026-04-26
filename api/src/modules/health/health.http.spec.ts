import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Express } from 'express';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('Health endpoint', () => {
  let app: INestApplication;
  let dataSource: {
    query: jest.Mock;
  };

  beforeEach(async () => {
    dataSource = {
      query: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 200 when the database is up', async () => {
    dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

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
    dataSource.query.mockRejectedValue(new Error('connection failed'));

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
