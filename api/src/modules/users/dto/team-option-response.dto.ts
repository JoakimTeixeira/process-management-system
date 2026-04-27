import { Expose } from 'class-transformer';

export class TeamOptionResponseDto {
  @Expose()
  id!: string;

  @Expose()
  code!: string;

  @Expose()
  name!: string;

  constructor(partial: Partial<TeamOptionResponseDto>) {
    Object.assign(this, partial);
  }
}
