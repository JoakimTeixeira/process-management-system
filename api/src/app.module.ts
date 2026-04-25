import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AssetsModule } from './modules/assets/assets.module';
import { AreasModule } from './modules/areas/areas.module';
import { HealthModule } from './modules/health/health.module';
import { ItilPracticesModule } from './modules/itil_practices/itil-practices.module';
import { ProcessVersionsModule } from './modules/process_versions/process-versions.module';
import { ProcessesModule } from './modules/processes/processes.module';
import { ProceduresModule } from './modules/procedures/procedures.module';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import { validateEnvironment } from './config/env.validation';
import { createTypeOrmModuleOptions } from './database/typeorm-options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV ?? 'development'}.local`,
        `.env.${process.env.NODE_ENV ?? 'development'}`,
        '.env.local',
        '.env',
      ],
      load: [appConfig, authConfig, databaseConfig],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (dbConfig: ConfigType<typeof databaseConfig>) =>
        createTypeOrmModuleOptions(dbConfig),
    }),
    AuthModule,
    AssetsModule,
    ItilPracticesModule,
    AreasModule,
    ProcessesModule,
    ProcessVersionsModule,
    ProceduresModule,
    HealthModule,
  ],
})
export class AppModule {}
