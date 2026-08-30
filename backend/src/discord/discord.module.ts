import { Logger, Module } from '@nestjs/common';
import type { AppConfig } from '../core/config';
import { CONFIG } from '../core/config';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { DISCORD_INTERACTION_HANDLER, DiscordController } from './discord.controller';
import { PostgresDiscordCommandAuditRepository } from './command-audit.repository';
import { PostgresDiscordIdentityRepository } from './identity.repository';
import { createDiscordInteractionHandler, isDiscordCommandName } from './interactions';
import { createPostgresDiscordRateLimiter } from './rate-limiter';

@Module({
  imports: [WalletModule],
  controllers: [DiscordController],
  providers: [
    {
      // Interaction requests are public by Discord's design, so this boundary
      // exists only after complete, fail-closed configuration. The pool is
      // part of that configuration now and not only a wallet dependency: the
      // rate limiter counts in the database, and an endpoint with nowhere to
      // count is an endpoint with no limit.
      provide: DISCORD_INTERACTION_HANDLER,
      inject: [CONFIG, PG_POOL, WalletService],
      useFactory: (config: AppConfig, pool: Queryable | null, wallet: WalletService | null) => {
        const interactions = config.discordInteractions;
        if (!interactions.enabled || !pool || !wallet) return null;
        const logger = new Logger('DiscordInteractions');
        return createDiscordInteractionHandler({
          publicKey: interactions.publicKey,
          policy: interactions.policy,
          identityRepository: new PostgresDiscordIdentityRepository(pool),
          walletService: wallet,
          rateLimiter: createPostgresDiscordRateLimiter({
            pool,
            isCommandName: isDiscordCommandName,
            limit: interactions.rateLimit.limit,
            windowMs: interactions.rateLimit.windowMs,
            onError: (error) =>
              logger.warn(
                `rate limit check failed: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              ),
          }),
          commandAuditor: new PostgresDiscordCommandAuditRepository(pool),
          // A lost audit row is the one failure this boundary reports out loud
          // rather than swallowing into the member's reply: nothing else would
          // ever notice it.
          onAuditError: (error) =>
            logger.error(
              `command audit write failed: ${
                error instanceof Error ? error.message : String(error)
              }`,
            ),
        });
      },
    },
  ],
})
export class DiscordModule {}
