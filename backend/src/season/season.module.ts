import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { SeasonController } from './season.controller';
import { PostgresSeasonRepository } from './season.repository';
import { SeasonService } from './season.service';

@Module({
  imports: [AuthModule],
  controllers: [SeasonController],
  providers: [
    {
      provide: SeasonService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new SeasonService(new PostgresSeasonRepository(pool)) : null,
    },
  ],
  exports: [SeasonService],
})
export class SeasonModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Session, consent and CSRF guards run after middleware. Protect owner
    // ranks, season receipts and rejected requests from shared edge caches.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(SeasonController);
  }
}
