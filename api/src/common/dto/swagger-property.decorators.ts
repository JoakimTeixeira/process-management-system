import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import { MAX_TEXT_LENGTH } from '../constants/workflow.constants';
import { trimString } from '../utils/trim-string-transform.util';

export function TrimmedRequiredTextProperty(
  description: string,
  example: string,
  maxLength: number = MAX_TEXT_LENGTH,
): PropertyDecorator {
  return applyDecorators(
    ApiProperty({ type: String, description, example, maxLength }),
    Transform(trimString),
    IsString(),
    MinLength(1),
    MaxLength(maxLength),
  );
}

export function RequiredUuidProperty(description: string): PropertyDecorator {
  return applyDecorators(
    ApiProperty({ type: String, description, format: 'uuid' }),
    IsUUID(),
  );
}

export function ExposedUuidProperty(description: string): PropertyDecorator {
  return applyDecorators(
    ApiProperty({ type: String, description, format: 'uuid' }),
    Expose(),
  );
}

export function ExposedStringProperty(description: string): PropertyDecorator {
  return applyDecorators(ApiProperty({ type: String, description }), Expose());
}

export function ExposedNullableStringProperty(
  description: string,
): PropertyDecorator {
  return applyDecorators(
    ApiProperty({ description, type: String, nullable: true }),
    Expose(),
  );
}

export function ExposedNestedProperty(
  description: string,
  typeConstructor: new (...args: never[]) => unknown,
): PropertyDecorator {
  return applyDecorators(
    ApiProperty({ description, type: typeConstructor }),
    Expose(),
    Type(() => typeConstructor),
  );
}
