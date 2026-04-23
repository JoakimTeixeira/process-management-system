import { Expose } from 'class-transformer';

export class ItilPracticeResponseDto {
  @Expose()
  id!: string;

  @Expose()
  code!: string;

  @Expose()
  name!: string;

  @Expose()
  description!: string | null;

  constructor(partial: Partial<ItilPracticeResponseDto>) {
    Object.assign(this, partial);
  }
}
