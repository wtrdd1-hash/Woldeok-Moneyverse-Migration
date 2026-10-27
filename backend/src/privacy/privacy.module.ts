import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { PrivacyController } from './privacy.controller';
import { PostgresPrivacyRequestRepository } from './privacy.repository';
import { PrivacyRequestService } from './privacy.service';

@Module({
  imports: [AuthModule],
  controllers: [PrivacyController],
  providers: [
    {
      provide: PrivacyRequestService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new PrivacyRequestService(new PostgresPrivacyRequestRepository(pool)) : null,
    },
  ],
  exports: [PrivacyRequestService],
})
export class PrivacyModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Middleware runs before guards, so 401/403 responses cannot accidentally be cached.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      next();
    }).forRoutes(PrivacyController);
  }
}
