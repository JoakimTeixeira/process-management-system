import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import { Role } from '../../../common/enums/role.enum';
import { trimString } from '../../../common/utils/trim-string-transform.util';
import { ApiPropertyOptional } from '@nestjs/swagger';

function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function normalizeRoleName({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Updated display name for the technical user.',
    example: 'Alice Reviewer',
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated email address for the technical user.',
    example: 'alice.reviewer@pms.local',
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsOptional()
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(MAX_TEXT_LENGTH)
  email?: string;

  @ApiPropertyOptional({
    description: 'Updated role UUID to assign.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({
    description: 'Updated symbolic role name to assign instead of roleId.',
    enum: Role,
  })
  @IsOptional()
  @Transform(normalizeRoleName)
  @IsEnum(Role)
  roleName?: Role;

  @ApiPropertyOptional({
    description: 'Updated team UUID for the user.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'Whether the user remains active.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
