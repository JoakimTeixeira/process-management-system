import { HealthController } from './health.controller';
import { HealthService, HealthStatus } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthService & {
    getStatus: jest.Mock;
  };

  beforeEach(() => {
    healthService = {
      getStatus: jest.fn(),
    };

    controller = new HealthController(healthService);
  });

  it('should return health status', async () => {
    const mockStatus: HealthStatus = {
      status: 'UP',
      checks: {
        database: 'UP',
      },
    };
    healthService.getStatus.mockResolvedValue(mockStatus);

    await expect(controller.getHealth()).resolves.toEqual(mockStatus);
    expect(healthService.getStatus).toHaveBeenCalled();
  });

  it('should propagate service failure when unhealthy', async () => {
    const error = new Error('Database connection failed');
    healthService.getStatus.mockRejectedValue(error);

    await expect(controller.getHealth()).rejects.toThrow(error);
    expect(healthService.getStatus).toHaveBeenCalled();
  });
});
