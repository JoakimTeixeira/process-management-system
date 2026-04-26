import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';

function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class LoginDto {
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(MAX_TEXT_LENGTH)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  password!: string;
}
