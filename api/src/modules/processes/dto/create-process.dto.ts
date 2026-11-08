import {
  RequiredUuidProperty,
  TrimmedRequiredTextProperty,
} from '../../../common/dto/swagger-property.decorators';

export class CreateProcessDto {
  @TrimmedRequiredTextProperty(
    'Business-facing title of the process.',
    'Incident Resolution',
  )
  title!: string;

  @TrimmedRequiredTextProperty(
    'Short description of the process scope.',
    'Restores affected services after incidents are diagnosed.',
  )
  description!: string;

  @RequiredUuidProperty('Owning team UUID for the process.')
  teamId!: string;

  @RequiredUuidProperty('Owner UUID for the process.')
  ownerId!: string;

  @RequiredUuidProperty('Parent area UUID for the process.')
  areaId!: string;
}
