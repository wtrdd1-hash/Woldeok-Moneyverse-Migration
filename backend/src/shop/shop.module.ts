import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { ShopController } from './shop.controller';
import { PostgresShopRepository, ShopCatalogRepository } from './shop.repository';
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
    {
      // A factory, not a class provider. `ShopCatalogRepository`'s constructor
      // takes `Queryable`, which is an interface: TypeScript erases it to
      // `Object` in design:paramtypes, so Nest has no token to resolve and
      // AppModule throws at bootstrap -- taking the whole API down, not just
      // the shop.
      //
      // Null with no DATABASE_URL, because the application has to boot and
      // answer 503 on these routes rather than refuse to start.
      provide: ShopCatalogRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new ShopCatalogRepository(pool) : null),
    },
  ],
  exports: [ShopService],
})
export class ShopModule {}
