import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SWAGGER_BEARER_AUTH_NAME } from '../../common/swagger/swagger.constants';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { MeResponseDto } from './dto/me-response.dto';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Authenticate a user and issue a JWT access token',
  })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({
    description: 'JWT access token issued successfully.',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid login payload.' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @ApiBearerAuth(SWAGGER_BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Get the authenticated user context' })
  @ApiOkResponse({
    description: 'Authenticated user context resolved from the JWT.',
    type: MeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT bearer token is missing or invalid.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser): MeResponseDto {
    return new MeResponseDto({
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.roleId,
        name: user.role,
      },
      team: user.team,
    });
  }
}
