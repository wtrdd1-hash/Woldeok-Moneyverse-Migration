import { Module } from '@nestjs/common';
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
export class StockModule {}
