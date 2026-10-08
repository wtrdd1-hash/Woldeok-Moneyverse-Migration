import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { AuctionGateway } from './auction.gateway';
import { BlackMarketController } from './black-market.controller';
import { BlackMarketRepository } from './black-market.repository';

@Module({
  imports: [AuthModule],
  controllers: [MarketplaceController, BlackMarketController],
  providers: [
    MarketplaceService,
    AuctionGateway,
    {
      provide: BlackMarketRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new BlackMarketRepository(pool) : null),
    },
  ],
  exports: [MarketplaceService, AuctionGateway, BlackMarketRepository],
})
export class MarketplaceModule {}
