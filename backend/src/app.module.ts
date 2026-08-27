import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { HealthModule } from './health/health.module';

@Module({ imports: [CoreModule, AuthModule, HealthModule] })
export class AppModule {}
