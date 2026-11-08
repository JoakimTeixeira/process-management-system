import {
  ExposedNestedProperty,
  ExposedNullableStringProperty,
  ExposedStringProperty,
  ExposedUuidProperty,
} from '../../../common/dto/swagger-property.decorators';

class AreaItilPracticeSummaryDto {
  @ExposedUuidProperty('Unique identifier for the linked ITIL practice.')
  id!: string;

  @ExposedStringProperty('Display name for the linked ITIL practice.')
  name!: string;
}

export class AreaResponseDto {
  @ExposedUuidProperty('Unique identifier for the area.')
  id!: string;

  @ExposedStringProperty('System-generated area code.')
  code!: string;

  @ExposedStringProperty('Business-facing title of the area.')
  title!: string;

  @ExposedNullableStringProperty('Description of the area scope.')
  description!: string | null;

  @ExposedUuidProperty('Owning team UUID.')
  teamId!: string;

  @ExposedStringProperty('Owning team display name.')
  teamName!: string;

  @ExposedUuidProperty('Owner UUID.')
  ownerId!: string;

  @ExposedStringProperty('Owner display name.')
  ownerName!: string;

  @ExposedUuidProperty('Linked ITIL practice UUID.')
  itilPracticeId!: string;

  @ExposedNestedProperty(
    'Linked ITIL practice summary.',
    AreaItilPracticeSummaryDto,
  )
  itilPractice!: AreaItilPracticeSummaryDto;

  constructor(partial: Partial<AreaResponseDto>) {
    Object.assign(this, partial);
  }
}
