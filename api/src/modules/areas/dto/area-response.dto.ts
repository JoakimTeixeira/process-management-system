import { Expose, Type } from 'class-transformer';

class AreaItilPracticeSummaryDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;
}

export class AreaResponseDto {
  @Expose()
  id!: string;

  @Expose()
  code!: string;

  @Expose()
  title!: string;

  @Expose()
  description!: string | null;

  @Expose()
  teamId!: string;

  @Expose()
  teamName!: string;

  @Expose()
  ownerId!: string;

  @Expose()
  ownerName!: string;

  @Expose()
  itilPracticeId!: string;

  @Expose()
  @Type(() => AreaItilPracticeSummaryDto)
  itilPractice!: AreaItilPracticeSummaryDto;

  constructor(partial: Partial<AreaResponseDto>) {
    Object.assign(this, partial);
  }
}
