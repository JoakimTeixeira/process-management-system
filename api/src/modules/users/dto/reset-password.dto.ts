import { IsString, MaxLength, MinLength } from 'class-validator';

import { MAX_TEXT_LENGTH } from '../../../common/constants/workflow.constants';

export class ResetPasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_TEXT_LENGTH)
  newPassword!: string;
}
