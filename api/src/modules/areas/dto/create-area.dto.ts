import {
  RequiredUuidProperty,
  TrimmedRequiredTextProperty,
} from '../../../common/dto/swagger-property.decorators';

export class CreateAreaDto {
  @TrimmedRequiredTextProperty(
    'Business-facing title of the area.',
    'Service Transition',
  )
  title!: string;

  @TrimmedRequiredTextProperty(
    'Short description of the area scope.',
    'Coordinates controlled changes into live service.',
  )
  description!: string;

  @RequiredUuidProperty('Owning team UUID for the area.')
  teamId!: string;

  @RequiredUuidProperty('Owner UUID for the area.')
  ownerId!: string;

  @RequiredUuidProperty('Linked ITIL practice UUID.')
  itilPracticeId!: string;
}
