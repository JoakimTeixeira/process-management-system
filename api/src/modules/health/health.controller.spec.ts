import { HealthController } from './health.controller';
import { HealthService } from './health.service';

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

  it('should return health status', () => {
    const mockStatus = { status: 'ok' };
    healthService.getStatus.mockReturnValue(mockStatus);

    const result = controller.getHealth();

    expect(result).toEqual(mockStatus);
    expect(healthService.getStatus).toHaveBeenCalled();
  });

  it('should return error status when service is unhealthy', () => {
    const mockStatus = {
      status: 'error',
      message: 'Database connection failed',
    };
    healthService.getStatus.mockReturnValue(mockStatus);

    const result = controller.getHealth();

    expect(result).toEqual(mockStatus);
    expect(healthService.getStatus).toHaveBeenCalled();
  });
});
