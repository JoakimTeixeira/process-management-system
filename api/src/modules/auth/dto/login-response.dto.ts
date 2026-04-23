import { Expose } from 'class-transformer';

export class LoginResponseDto {
  @Expose()
  accessToken!: string;

  @Expose()
  tokenType!: 'Bearer';

  @Expose()
  expiresIn!: number;

  @Expose()
  expiresAt!: string;

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
