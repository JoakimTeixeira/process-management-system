import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { Role, isRole } from '../../../common/enums/role.enum';
import { trimString } from '../../../common/utils/trim-string-transform.util';

function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function normalizeRoleName({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class CreateUserDto {
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  name!: string;

  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(MAX_TEXT_LENGTH)
  email!: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @Transform(normalizeRoleName)
  @IsString()
  roleName?: Role;

  @IsUUID()
  teamId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  password!: string;

  hasValidRoleName(): boolean {
    return this.roleName !== undefined && isRole(this.roleName);
  }
}
