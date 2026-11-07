import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { BankController } from './bank.controller';
import { BankRepository } from './bank.repository';
import { PocketController } from './pocket.controller';

@Module({
  imports: [AuthModule],
  controllers: [BankController, PocketController],
  providers: [
    {
      provide: BankRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new BankRepository(pool) : null),
    },
  ],
  exports: [BankRepository],
})
export class BankModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Banking and pocket responses include owner financial data and write receipts.
    // Set headers before session, consent and CSRF guards, including 401/403 paths.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(BankController, PocketController);
  }
}
