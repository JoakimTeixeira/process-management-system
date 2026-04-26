import { ServiceUnavailableException } from '@nestjs/common';
import type { DataSource } from 'typeorm';

import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let dataSource: jest.Mocked<Pick<DataSource, 'query'>>;

  beforeEach(() => {
    dataSource = {
      query: jest.fn(),
    };

    service = new HealthService(dataSource as unknown as DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return up status when database probe succeeds', async () => {
    dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

    await expect(service.getStatus()).resolves.toEqual({
      status: 'UP',
      checks: {
        database: 'UP',
      },
    });
    expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('should throw service unavailable when database probe fails', async () => {
    dataSource.query.mockRejectedValue(new Error('connection failed'));

    try {
      await service.getStatus();
      fail('Expected getStatus to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ServiceUnavailableException);
      expect((error as ServiceUnavailableException).getStatus()).toBe(503);
      expect((error as ServiceUnavailableException).getResponse()).toEqual({
        status: 'DOWN',
        checks: {
          database: 'DOWN',
        },
      });
    }
  });
});
