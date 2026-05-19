import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import { HealthStatusResponseDto } from './dto/health-status-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @ApiOperation({ summary: 'Run the API health check' })
  @ApiOkResponse({
    description: 'API and database connectivity are healthy.',
    type: HealthStatusResponseDto,
    schema: {
      example: {
        status: 'UP',
        checks: {
          database: 'UP',
        },
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'One or more health checks failed.',
    type: HealthStatusResponseDto,
    schema: {
      example: {
        status: 'DOWN',
        checks: {
          database: 'DOWN',
        },
      },
    },
  })
  @Get()
  getHealth(): Promise<HealthStatusResponseDto> {
    return this.healthService.getStatus();
  }
}
