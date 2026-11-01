import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
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
export class ShopModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Owner purchase, inventory and settlement responses must remain private even
    // when authentication/consent/CSRF guards reject the request. Public item,
    // catalogue and cosmetics reads deliberately retain their public policy.
    const ownerRoutes = [
      'shop/purchases',
      'shop/purchases/export',
      'shop/catalog',
      'shop/compare',
      'shop/holdings',
      'shop/items/:id/purchases',
      'shop/catalog/:id/purchases',
      'shop/holdings/:id/equip',
      'shop/holdings/:id/consumptions',
      'shop/holdings/:id/upkeep-settlements',
    ];
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(...ownerRoutes.map((path) => ({ path, method: RequestMethod.ALL })));
  }
}
