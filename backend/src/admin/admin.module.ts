import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { StockModule } from '../stock/stock.module';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { GameCatalogController } from './game-catalog.controller';
import { PostgresGameCatalogRepository } from './game-catalog.repository';

@Module({
  imports: [AuthModule, StockModule],
  controllers: [AdminController, GameCatalogController],
  providers: [
    {
      provide: AdminService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new AdminService({ repository: new AdminRepository(pool) }) : null,
    },
    {
      provide: PostgresGameCatalogRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new PostgresGameCatalogRepository(pool) : null,
    },
  ],
  exports: [AdminService],
})
export class AdminModule {}
