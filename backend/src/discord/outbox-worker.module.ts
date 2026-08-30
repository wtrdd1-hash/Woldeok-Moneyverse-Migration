import { Inject, Injectable, Logger, Module } from '@nestjs/common';
import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import type { AppConfig } from '../core/config';
import { CONFIG } from '../core/config';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { DiscordOutboxWorker } from './outbox-worker';

/**
 * Runs the Discord outbox, if this deployment is told to.
 *
 * The worker existed for eleven migrations without ever being constructed:
 * no provider, no runner, no environment variable that could have supplied
 * its token. Migration 054's postmortem — "the Discord outbox has therefore
 * never delivered anything" — is what a background job with no runner looks
 * like from the outside.
 *
 * Shaped after `MarketTickerRunner`, which is how this codebase starts a
 * recurring job: a nullable factory that reads its switch at boot, and a
 * runner that starts it on bootstrap and stops it on shutdown. The difference
 * is that the reason for being off is logged rather than implied — an outbox
 * that is silently not delivering is exactly the failure this PR is undoing.
 */
export const DISCORD_OUTBOX_WORKER = Symbol('DISCORD_OUTBOX_WORKER');

@Injectable()
export class DiscordOutboxWorkerRunner implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger('DiscordOutbox');

  constructor(
    @Inject(DISCORD_OUTBOX_WORKER) private readonly worker: DiscordOutboxWorker | null,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  onApplicationBootstrap(): void {
    const outbox = this.config.discordOutbox;
    if (!this.worker || !outbox.enabled) {
      // Why, not just that it is off. 054's postmortem is what a background
      // job that says nothing about itself costs.
      this.logger.log(
        `outbox worker not running: ${outbox.enabled ? 'no database connection' : outbox.reason}`,
      );
      return;
    }
    this.worker.start();
    // The application, never the token: an operator reading this line is
    // asking which bot this stack is running as.
    this.logger.log(`delivering outbox events as application ${outbox.applicationId}`);
  }

  onApplicationShutdown(): void {
    this.worker?.stop();
  }
}

@Module({
  providers: [
    {
      provide: DISCORD_OUTBOX_WORKER,
      inject: [CONFIG, PG_POOL],
      useFactory: (config: AppConfig, pool: Queryable | null): DiscordOutboxWorker | null => {
        const outbox = config.discordOutbox;
        if (!outbox.enabled || !pool) return null;
        const logger = new Logger('DiscordOutbox');
        return new DiscordOutboxWorker({
          pool,
          token: outbox.botToken,
          channels: outbox.channels,
          intervalMs: outbox.intervalMs,
          onError: (error) =>
            logger.warn(error instanceof Error ? error.message : String(error)),
        });
      },
    },
    DiscordOutboxWorkerRunner,
  ],
})
export class DiscordOutboxWorkerModule {}
