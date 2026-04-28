import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token for authenticated API requests.',
  })
  @Expose()
  accessToken!: string;

  @ApiProperty({
    description: 'Token type returned by the authentication endpoint.',
    example: 'Bearer',
  })
  @Expose()
  tokenType!: 'Bearer';

  @ApiProperty({
    description: 'Token lifetime in seconds.',
    example: 3600,
  })
  @Expose()
  expiresIn!: number;

  @ApiProperty({
    description: 'UTC timestamp when the access token expires.',
    format: 'date-time',
  })
  @Expose()
  expiresAt!: string;

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
