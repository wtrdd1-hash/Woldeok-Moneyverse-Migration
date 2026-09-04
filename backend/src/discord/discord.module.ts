import { Logger, Module } from '@nestjs/common';
import type { AppConfig } from '../core/config';
import { CONFIG } from '../core/config';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { EncryptionService } from '../security/encryption.service';
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
      provide: DISCORD_INTERACTION_HANDLER,
      inject: [CONFIG, PG_POOL, WalletService, EncryptionService],
      useFactory: (
        config: AppConfig,
        pool: Queryable | null,
        wallet: WalletService | null,
        encryption: EncryptionService,
      ) => {
        const interactions = config.discordInteractions;
        if (!interactions.enabled || !pool || !wallet) return null;
        const logger = new Logger('DiscordInteractions');
        return createDiscordInteractionHandler({
          publicKey: interactions.publicKey,
          policy: interactions.policy,
          identityRepository: new PostgresDiscordIdentityRepository(pool, encryption),
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
