import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  ValidateIf,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
  MinLength,
} from 'class-validator';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { Role } from '../../../common/enums/role.enum';
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_PATTERN,
} from '../../../common/validation/password-policy';
import { trimString } from '../../../common/utils/trim-string-transform.util';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function normalizeRoleName({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Display name of the technical user.',
    example: 'Alice Editor',
    maxLength: MAX_TEXT_LENGTH,
  })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  name!: string;

  @ApiProperty({
    description: 'Unique email address for login and notifications.',
    example: 'alice.editor@pms.local',
    maxLength: MAX_TEXT_LENGTH,
  })
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(MAX_TEXT_LENGTH)
  email!: string;

  @ApiPropertyOptional({
    description:
      'UUID of an existing role to assign. Provide this or roleName.',
    format: 'uuid',
  })
  @ValidateIf(
    (createUserDto: CreateUserDto) => createUserDto.roleName === undefined,
  )
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({
    description: 'Symbolic role name to assign. Provide this or roleId.',
    enum: Role,
  })
  @ValidateIf(
    (createUserDto: CreateUserDto) => createUserDto.roleId === undefined,
  )
  @Transform(normalizeRoleName)
  @IsEnum(Role)
  roleName?: Role;

  @ApiProperty({
    description: 'Team UUID the user belongs to.',
    format: 'uuid',
  })
  @IsUUID()
  teamId!: string;

  @ApiProperty({
    description: 'Initial password that satisfies the backend password policy.',
    example: 'VeryStrongPassword!2026',
    minLength: MIN_PASSWORD_LENGTH,
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @Matches(PASSWORD_POLICY_PATTERN, { message: PASSWORD_POLICY_MESSAGE })
  @MaxLength(MAX_TEXT_LENGTH)
  password!: string;
}
