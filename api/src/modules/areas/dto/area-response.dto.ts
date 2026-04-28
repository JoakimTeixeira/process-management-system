import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AreaItilPracticeSummaryDto {
  @ApiProperty({
    description: 'Unique identifier for the linked ITIL practice.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Display name for the linked ITIL practice.',
  })
  @Expose()
  name!: string;
}

export class AreaResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the area.',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'System-generated area code.',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    description: 'Business-facing title of the area.',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Description of the area scope.',
    nullable: true,
  })
  @Expose()
  description!: string | null;

  @ApiProperty({
    description: 'Owning team UUID.',
    format: 'uuid',
  })
  @Expose()
  teamId!: string;

  @ApiProperty({
    description: 'Owning team display name.',
  })
  @Expose()
  teamName!: string;

  @ApiProperty({
    description: 'Owner UUID.',
    format: 'uuid',
  })
  @Expose()
  ownerId!: string;

  @ApiProperty({
    description: 'Owner display name.',
  })
  @Expose()
  ownerName!: string;

  @ApiProperty({
    description: 'Linked ITIL practice UUID.',
    format: 'uuid',
  })
  @Expose()
  itilPracticeId!: string;

  @ApiProperty({
    description: 'Linked ITIL practice summary.',
    type: () => AreaItilPracticeSummaryDto,
  })
  @Expose()
  @Type(() => AreaItilPracticeSummaryDto)
  itilPractice!: AreaItilPracticeSummaryDto;

  constructor(partial: Partial<AreaResponseDto>) {
    Object.assign(this, partial);
  }
}
