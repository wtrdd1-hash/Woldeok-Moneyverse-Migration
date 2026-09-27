import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { AuctionGateway } from './auction.gateway';

@Module({
  imports: [AuthModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceService, AuctionGateway],
  exports: [MarketplaceService, AuctionGateway],
})
export class MarketplaceModule {}

