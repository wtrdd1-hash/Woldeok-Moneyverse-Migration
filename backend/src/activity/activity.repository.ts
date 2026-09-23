import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../core/pool.provider';
import type { ActivityEventItemDto } from './activity.dto';

export interface ActivityLogRow {
  readonly id: string;
  readonly user_id: string | null;
  readonly username: string;
  readonly session_id: string;
  readonly event_type: string;
  readonly path: string;
  readonly target_label: string | null;
  readonly dwell_time_ms: number | null;
  readonly ip: string | null;
  readonly user_agent: string | null;
  readonly metadata: Record<string, unknown>;
  readonly created_at: Date;
}


export interface TrafficAnalyticsDashboard {
  readonly granularity: 'day' | 'month' | 'year';
  readonly periods: number;
  readonly rangeStart: string;
  readonly generatedAt: string;
  readonly summary: { readonly pageViews: number; readonly uniqueSessions: number; readonly authenticatedUsers: number; readonly anonymousSessions: number };
  readonly series: readonly { readonly bucket: string; readonly pageViews: number; readonly uniqueSessions: number; readonly authenticatedUsers: number }[];
  readonly landingPages: readonly { readonly path: string; readonly entries: number; readonly anonymousEntries: number }[];
  readonly sources: readonly { readonly source: string; readonly entries: number }[];
  readonly countries: readonly { readonly country: string; readonly entries: number }[];
}

export interface LogRequestInput {
  readonly actor: string | null;
  readonly path: string;
  readonly method: string;
  readonly status: number;
  readonly durationMs: number;
  readonly requestId: string | null;
  readonly ip: string | null;
  readonly userAgent: string | null;
  readonly country: string | null;
  readonly context: Record<string, unknown>;
}

@Injectable()
export class ActivityRepository implements OnModuleDestroy {
  private readonly logger = new Logger(ActivityRepository.name);
  private readonly requestBuffer: LogRequestInput[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {
    this.flushTimer = setInterval(() => {
      if (this.requestBuffer.length > 0 && !this.isFlushing) {
        void this.flushRequestLogs();
      }
    }, 500);
    this.flushTimer.unref?.();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flushRequestLogs();
  }

  async logEvents(
    events: ActivityEventItemDto[],
    actor: string | null,
    ip: string | null,
    userAgent: string | null,
    country: string | null,
  ): Promise<number> {
    if (events.length === 0) return 0;
    const client = await this.pool.connect();
    try {
      const result = await client.query<{ activity_log_events: number }>(
        'SELECT public.activity_log_events($1::jsonb, $2::uuid, $3::inet, $4::text, $5::text) AS activity_log_events',
        [JSON.stringify(events), actor, ip, userAgent, country],
      );
      return result.rows[0]?.activity_log_events ?? 0;
    } finally {
      client.release();
    }
  }

  async listLogs(
    actor: string,
    limit: number,
    offset: number,
    eventType?: string,
    userId?: string,
  ): Promise<ActivityLogRow[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<ActivityLogRow>(
        'SELECT * FROM public.admin_activity_list_logs($1::uuid, $2::integer, $3::integer, $4::text, $5::uuid)',
        [actor, limit, offset, eventType ?? null, userId ?? null],
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async trafficDashboard(
    actor: string,
    granularity: 'day' | 'month' | 'year',
    periods: number,
  ): Promise<TrafficAnalyticsDashboard> {
    const result = await this.pool.query<{ dashboard: TrafficAnalyticsDashboard }>(
      'SELECT public.admin_activity_traffic_dashboard($1::uuid, $2::text, $3::integer) AS dashboard',
      [actor, granularity, periods],
    );
    const dashboard = result.rows[0]?.dashboard;
    if (!dashboard) throw new Error('admin_activity_traffic_dashboard did not return a row');
    return dashboard;
  }

  async logRequest(input: LogRequestInput): Promise<void> {
    this.requestBuffer.push(input);
    if (this.requestBuffer.length >= 50 && !this.isFlushing) {
      void this.flushRequestLogs();
    }
  }

  async flushRequestLogs(): Promise<void> {
    if (this.isFlushing || this.requestBuffer.length === 0) return;
    this.isFlushing = true;
    const batch = this.requestBuffer.splice(0, 100);
    if (batch.length === 0) {
      this.isFlushing = false;
      return;
    }

    try {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        for (const item of batch) {
          await client.query(
            'SELECT public.activity_log_request_v2($1::uuid,$2,$3,$4,$5,$6::uuid,$7::inet,$8,$9,$10::jsonb)',
            [
              item.actor,
              item.path,
              item.method,
              item.status,
              item.durationMs,
              item.requestId,
              item.ip,
              item.userAgent,
              item.country,
              JSON.stringify(item.context),
            ],
          );
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        this.logger.error('Failed to flush activity log request batch', err);
      } finally {
        client.release();
      }
    } catch (poolErr) {
      this.logger.error('Database connection error while flushing activity batch', poolErr);
    } finally {
      this.isFlushing = false;
      if (this.requestBuffer.length >= 50) {
        void this.flushRequestLogs();
      }
    }
  }
}

