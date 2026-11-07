import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { SafetyController } from './safety.controller';
import { SafetyService } from './safety.service';
import { SafetyRepository } from './safety.repository';
import { AuthModule } from '../auth/auth.module';
import { PG_POOL } from '../core/pool.provider';
import type { Queryable } from '../core/db';

@Module({
  imports: [AuthModule],
  controllers: [SafetyController],
  providers: [
    {
      provide: SafetyRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new SafetyRepository(pool) : null),
    },
    {
      provide: SafetyService,
      inject: [SafetyRepository],
      useFactory: (repo: SafetyRepository | null) => (repo ? new SafetyService(repo) : null),
    },
  ],
  exports: [SafetyService, SafetyRepository],
})
export class SafetyModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Private reports and takedown status need protection even when guards reject a request.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(SafetyController);
  }
}
