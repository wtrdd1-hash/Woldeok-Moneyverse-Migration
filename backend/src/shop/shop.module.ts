import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { ShopController } from './shop.controller';
import { PostgresShopRepository } from './shop.repository';
import { ShopService } from './shop.service';

@Module({
  imports: [AuthModule],
  controllers: [ShopController],
  providers: [
    {
      provide: ShopService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new ShopService(new PostgresShopRepository(pool)) : null,
    },
  ],
  exports: [ShopService],
})
export class ShopModule {}
