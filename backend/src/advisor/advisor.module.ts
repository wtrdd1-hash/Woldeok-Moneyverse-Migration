import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { DeokiAdvisorController } from './deoki-advisor.controller';
import { DeokiAdvisorRepository } from './deoki-advisor.repository';

@Module({
  imports: [AuthModule],
  controllers: [DeokiAdvisorController],
  providers: [
    {
      provide: DeokiAdvisorRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new DeokiAdvisorRepository(pool) : null),
    },
  ],
  exports: [DeokiAdvisorRepository],
})
export class AdvisorModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // The advisor reads owner financial data; guard refusals must be private too.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(DeokiAdvisorController);
  }
}
