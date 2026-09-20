import { Module } from '@nestjs/common';
import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { EconomyAiReviewer, economyAiConfig } from '../economy/economy-ai-review';
import { AiNewsRepository } from '../admin/ai-news.repository';
import { AiNewsService, aiNewsRuntimeCredentialFrom } from '../admin/ai-news.service';
import { OperationsRepository } from '../admin/operations.repository';
import { sealingKeyFrom } from '../auth/totp';
import { Scheduler } from './scheduler';

/**
 * Starts the schedule, if this deployment has a database.
 *
 * `RECONCILER_DATABASE_URL` names the `moneyverse_reconciler` role and is
 * optional in the same way `STATUS_COLLECTOR_DATABASE_URL` is: without it the
 * hourly sweep and the daily chain verification still run, and reconciliation
 * does not. That is the honest degradation -- borrowing the application's
 * pool for it would defeat the check 018 exists to make.
 */
export const SCHEDULER = Symbol('SCHEDULER');

const FIVE_MINUTES = 300_000;

@Injectable()
export class SchedulerRunner implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger('Scheduler');

  constructor(@Inject(SCHEDULER) private readonly scheduler: Scheduler | null) {}

  onApplicationBootstrap(): void {
    if (!this.scheduler) {
      this.logger.log('no database; the schedule is not running');
      return;
    }
    this.scheduler.start();
    this.logger.log('schedule started');
  }

  onApplicationShutdown(): void {
    this.scheduler?.stop();
  }
}

@Module({
  providers: [
    {
      provide: SCHEDULER,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null): Scheduler | null => {
        if (!pool) return null;
        const reconcilerUrl = process.env.RECONCILER_DATABASE_URL;
        const logger = new Logger('Scheduler');
        const economyAiReviewer = new EconomyAiReviewer(pool, economyAiConfig());
        const aiNews = new AiNewsService(new AiNewsRepository(pool), sealingKeyFrom(process.env));
        const operations = new OperationsRepository(pool);
        return new Scheduler({
          app: pool,
          reconciler: reconcilerUrl ? new Pool({ connectionString: reconcilerUrl, max: 1 }) : null,
          intervalMs: Number.parseInt(process.env.SCHEDULER_INTERVAL_MS ?? '', 10) || FIVE_MINUTES,
          logger: {
            log: (message) => logger.log(message),
            warn: (message) => logger.warn(message),
            error: (message, stack) => logger.error(message, stack),
          },
          handlers: {
            'stock.ai_scenario_auto': async () => {
              if (process.env.AI_NEWS_AUTO_ENABLED !== 'true') return { skipped: true, reason: 'disabled' };
              const actorUserId = process.env.AI_NEWS_AUTO_ACTOR_USER_ID?.trim();
              if (!actorUserId) return { skipped: true, reason: 'actor_missing' };
              const runtimeCredential = aiNewsRuntimeCredentialFrom(process.env);
              return aiNews.autoGenerateAndPublish(actorUserId, runtimeCredential ?? undefined);
            },
            'work.auto_tune_policy': async () => {
              if (process.env.WORK_AUTOTUNE_ENABLED === 'false') {
                return { skipped: true, reason: 'disabled' };
              }
              const actorUserId = process.env.WORK_AUTOTUNE_ACTOR_USER_ID?.trim() || '5f7b8b44-e4aa-40b8-b93a-800ec0151d20';
              return operations.autoTuneWorkPolicy(actorUserId);
            },
            'economy.ai_shadow_health': () => economyAiReviewer.runShadow(),
            'economy.ai_policy_review': () => economyAiReviewer.run(),
          },
        });
      },
    },
    SchedulerRunner,
  ],
})
export class SchedulerModule {}
