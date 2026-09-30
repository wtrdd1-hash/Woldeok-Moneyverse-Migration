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

@Module({
  imports: [AuthModule],
  controllers: [StockController, StockAlertController, NewspaperController, DerivativesController],
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
  ],
  exports: [StockService, StockAlertRepository],
})
export class StockModule {}
