import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import type { ConfigType } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import authConfig from '../../config/auth.config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [authConfig.KEY],
      useFactory: (authConfiguration: ConfigType<typeof authConfig>) => ({
        secret: authConfiguration.jwtSecret,
        signOptions: { expiresIn: authConfiguration.jwtExpiresInSeconds },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: 'JWT_SIGNER',
      inject: [JwtService],
      useFactory: (jwtService: JwtService) => jwtService,
    },
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
