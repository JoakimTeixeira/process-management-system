import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_PATTERN,
} from '../../../common/validation/password-policy';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Replacement password for the selected technical user.',
    example: 'AnotherStrongPassword!2026',
    minLength: MIN_PASSWORD_LENGTH,
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @Matches(PASSWORD_POLICY_PATTERN, { message: PASSWORD_POLICY_MESSAGE })
  @MaxLength(MAX_TEXT_LENGTH)
  newPassword!: string;
}
