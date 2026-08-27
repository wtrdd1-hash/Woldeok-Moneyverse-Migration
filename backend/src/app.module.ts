import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { HealthModule } from './health/health.module';
import { AUTH_LIMIT, READ_LIMIT, SENSITIVE_LIMIT } from './security/rate-limit';

const ONE_MINUTE_MS = 60_000;

@Module({
  imports: [
    CoreModule,
    AuthModule,
    HealthModule,
    // Process-local, exactly as in the original application. That is correct
    // for the single-instance deployment and becomes N times weaker on any
    // scale-out: a known limitation, tracked rather than overlooked. A shared
    // atomic limiter is separate work.
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'auth', ttl: ONE_MINUTE_MS, limit: AUTH_LIMIT },
        { name: 'sensitive', ttl: ONE_MINUTE_MS, limit: SENSITIVE_LIMIT },
        { name: 'read', ttl: ONE_MINUTE_MS, limit: READ_LIMIT },
      ],
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
