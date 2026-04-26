import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export type HealthStatus = {
  status: 'UP' | 'DOWN';
  checks: {
    database: 'UP' | 'DOWN';
  };
};

@Injectable()
export class HealthService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getStatus(): Promise<HealthStatus> {
    try {
      await this.dataSource.query('SELECT 1');

      return {
        status: 'UP',
        checks: {
          database: 'UP',
        },
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'DOWN',
        checks: {
          database: 'DOWN',
        },
      });
    }
  }
}
