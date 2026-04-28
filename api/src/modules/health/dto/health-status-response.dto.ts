import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class HealthChecksResponseDto {
  @ApiProperty({
    description: 'Database connectivity status.',
    enum: ['UP', 'DOWN'],
    example: 'UP',
  })
  @Expose()
  database!: 'UP' | 'DOWN';
}

export class HealthStatusResponseDto {
  @ApiProperty({
    description: 'Overall API health state.',
    enum: ['UP', 'DOWN'],
    example: 'UP',
  })
  @Expose()
  status!: 'UP' | 'DOWN';

  @ApiProperty({
    description:
      'Individual infrastructure checks included in the health probe.',
    type: () => HealthChecksResponseDto,
  })
  @Expose()
  @Type(() => HealthChecksResponseDto)
  checks!: HealthChecksResponseDto;
}
