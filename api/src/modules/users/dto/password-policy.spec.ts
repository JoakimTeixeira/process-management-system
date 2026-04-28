import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateUserDto } from './create-user.dto';
import { ResetPasswordDto } from './reset-password.dto';

describe('User password policy DTO validation', () => {
  it('rejects create-user passwords shorter than 16 characters', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: 'Alice Editor',
      email: 'alice@example.com',
      roleName: 'EDITOR',
      teamId: '123e4567-e89b-42d3-a456-426614174000',
      password: 'Short1!',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('rejects reset passwords that miss required character classes', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      newPassword: 'alllowercase12345',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'newPassword')).toBe(true);
  });

  it('accepts passwords that satisfy the full policy', async () => {
    const createDto = plainToInstance(CreateUserDto, {
      name: 'Alice Editor',
      email: 'alice@example.com',
      roleName: 'EDITOR',
      teamId: '123e4567-e89b-42d3-a456-426614174000',
      password: 'StrongPassword1!',
    });
    const resetDto = plainToInstance(ResetPasswordDto, {
      newPassword: 'AnotherStrongPwd9#',
    });

    await expect(validate(createDto)).resolves.toHaveLength(0);
    await expect(validate(resetDto)).resolves.toHaveLength(0);
  });
});
