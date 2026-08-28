import { Module } from '@nestjs/common';
import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import type { AppConfig } from '../core/config';
import { CONFIG } from '../core/config';
import {
  StatusCollector,
  apiProbe,
  databaseProbe,
  webProbe,
} from './status-collector';
import type { Fetcher } from './status-collector';

/**
 * Starts the collector, if this deployment gave it a credential.
 *
 * `STATUS_COLLECTOR_DATABASE_URL` names the `moneyverse_status_collector`
 * role, which may execute one function and read nothing. It is deliberately
 * separate from the application's own connection: 013 revokes the status
 * write from the application role so that a SQL injection through a request
 * cannot claim the service is healthy, and borrowing the application's pool
 * here would hand that back.
 *
 * Absent, nothing runs and /status keeps saying 확인 중 — which is the honest
 * answer for a deployment that is not collecting.
 */
export const STATUS_COLLECTOR = Symbol('STATUS_COLLECTOR');

const fetcher: Fetcher = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  return { ok: response.ok, status: response.status };
};

@Injectable()
export class StatusCollectorRunner implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger('StatusCollector');

  constructor(@Inject(STATUS_COLLECTOR) private readonly collector: StatusCollector | null) {}

  onApplicationBootstrap(): void {
    if (!this.collector) {
      this.logger.log('no collector credential configured; not collecting');
      return;
    }
    this.collector.start();
    this.logger.log('collecting service status');
  }

  onApplicationShutdown(): void {
    this.collector?.stop();
  }
}

@Module({
  providers: [
    {
      provide: STATUS_COLLECTOR,
      inject: [CONFIG],
      useFactory: (config: AppConfig): StatusCollector | null => {
        const url = process.env.STATUS_COLLECTOR_DATABASE_URL;
        if (!url) return null;

        const interval = Number(process.env.STATUS_COLLECT_INTERVAL_MS ?? 30_000);
        // The pool is tiny on purpose: this writes three rows a minute.
        const recorder = new Pool({ connectionString: url, max: 2 });
        const port = config.port;
        const logger = new Logger('StatusCollector');

        return new StatusCollector({
          recorder,
          intervalMs: Number.isFinite(interval) && interval >= 1000 ? interval : 30_000,
          probes: [
            databaseProbe(recorder),
            apiProbe(fetcher, `http://127.0.0.1:${port}/health`),
            // The frontend by its service name on the compose network. This is
            // the tier a visitor actually lands on, and it can be down while
            // the API is fine.
            webProbe(fetcher, process.env.WEB_HEALTH_URL ?? 'http://frontend:3000/'),
          ],
          onError: (sourceKey, error) =>
            logger.warn(`${sourceKey}: ${error instanceof Error ? error.message : String(error)}`),
        });
      },
    },
    StatusCollectorRunner,
  ],
})
export class StatusCollectorModule {}
