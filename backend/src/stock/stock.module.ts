import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { StockController } from './stock.controller';
import { PostgresStockRepository } from './stock.repository';
import { StockService } from './stock.service';

@Module({
  imports: [AuthModule],
  controllers: [StockController],
  providers: [
    {
      provide: StockService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new StockService(new PostgresStockRepository(pool)) : null,
    },
  ],
  exports: [StockService],
})
export class StockModule {}
