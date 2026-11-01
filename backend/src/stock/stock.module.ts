import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { DerivativesController } from './derivatives.controller';
import { NewspaperController } from './newspaper.controller';
import { StockAlertController } from './stock-alert.controller';
import { StockAlertRepository } from './stock-alert.repository';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { PostgresStockRepository } from './stock.repository';
import { MarketBroadcast } from './market-broadcast';
import { StockLeagueController } from './stock-league.controller';
import { StockLeagueRepository } from './stock-league.repository';

@Module({
  imports: [AuthModule],
  controllers: [
    StockController,
    StockAlertController,
    NewspaperController,
    DerivativesController,
    StockLeagueController,
  ],
  providers: [
    {
      provide: StockService,
      inject: [PG_POOL, { token: MarketBroadcast, optional: true }],
      useFactory: (pool: Queryable | null, broadcast?: MarketBroadcast) =>
        pool ? new StockService(new PostgresStockRepository(pool), broadcast) : null,
    },
    {
      provide: StockAlertRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new StockAlertRepository(pool) : null),
    },
    {
      provide: StockLeagueRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new StockLeagueRepository(pool) : null),
    },
  ],
  exports: [StockService, StockAlertRepository, StockLeagueRepository],
})
export class StockModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Fail closed for every owner route, including future owner endpoints and
    // guard failures. Only explicitly public GET/HEAD price reads are exempt.
    consumer.apply((req: Request, res: Response, next: NextFunction) => {
      const publicRead = (req.method === 'GET' || req.method === 'HEAD') && (
        /(?:^|\/)stocks$/.test(req.path) ||
        /(?:^|\/)stocks\/(?:sparklines|market-events)$/.test(req.path) ||
        /(?:^|\/)stocks\/[0-9a-f-]{36}\/(?:prices|candles)$/i.test(req.path)
      );
      if (!publicRead) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('X-Robots-Tag', 'noindex');
        res.setHeader('Referrer-Policy', 'no-referrer');
      }
      next();
    }).forRoutes(StockController);
  }
}
