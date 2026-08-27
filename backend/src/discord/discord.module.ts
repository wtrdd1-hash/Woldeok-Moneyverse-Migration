import { Module } from '@nestjs/common';
import type { AppConfig } from '../core/config';
import { CONFIG } from '../core/config';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { DISCORD_INTERACTION_HANDLER, DiscordController } from './discord.controller';
import { PostgresDiscordIdentityRepository } from './identity.repository';
import {
  createDiscordInteractionHandler,
  createFixedWindowDiscordRateLimiter,
} from './interactions';

@Module({
  imports: [WalletModule],
  controllers: [DiscordController],
  providers: [
    {
      // Interaction requests are public by Discord's design, so this boundary
      // exists only after complete, fail-closed configuration. It is null in
      // production regardless: the bundled limiter is single-process only.
      provide: DISCORD_INTERACTION_HANDLER,
      inject: [CONFIG, PG_POOL, WalletService],
      useFactory: (config: AppConfig, pool: Queryable | null, wallet: WalletService | null) => {
        const interactions = config.discordInteractions;
        if (!interactions.enabled || !pool || !wallet) return null;
        return createDiscordInteractionHandler({
          publicKey: interactions.publicKey,
          policy: interactions.policy,
          identityRepository: new PostgresDiscordIdentityRepository(pool),
          walletService: wallet,
          rateLimiter: createFixedWindowDiscordRateLimiter(interactions.rateLimit),
        });
      },
    },
  ],
})
export class DiscordModule {}
