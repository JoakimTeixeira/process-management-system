import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';

function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email address used to authenticate the user.',
    example: 'editor@pms.local',
    maxLength: MAX_TEXT_LENGTH,
  })
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(MAX_TEXT_LENGTH)
  email!: string;

  @ApiProperty({
    description:
      'Plain-text password that satisfies the backend password policy.',
    example: 'StrongPassword!2026',
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  password!: string;
}
