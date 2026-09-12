import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { StockAlertController } from './stock-alert.controller';
import { StockAlertRepository } from './stock-alert.repository';
import { StockController } from './stock.controller';
import { PostgresStockRepository } from './stock.repository';
import { StockService } from './stock.service';

@Module({
  imports: [AuthModule],
  controllers: [StockController, StockAlertController],
  providers: [
    {
      provide: StockService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new StockService(new PostgresStockRepository(pool)) : null,
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
