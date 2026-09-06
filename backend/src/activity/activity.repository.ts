import { Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class ActivityRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

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
    limit: number,
    offset: number,
    eventType?: string,
    userId?: string,
  ): Promise<ActivityLogRow[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<ActivityLogRow>(
        'SELECT * FROM public.activity_list_logs($1::integer, $2::integer, $3::text, $4::uuid)',
        [limit, offset, eventType ?? null, userId ?? null],
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async logRequest(input: {
    readonly actor: string | null;
    readonly path: string;
    readonly method: string;
    readonly status: number;
    readonly durationMs: number;
    readonly requestId: string | null;
    readonly ip: string | null;
    readonly userAgent: string | null;
    readonly country: string | null;
  }): Promise<void> {
    await this.pool.query(
      'SELECT public.activity_log_request($1::uuid,$2,$3,$4,$5,$6::uuid,$7::inet,$8,$9)',
      [
        input.actor,
        input.path,
        input.method,
        input.status,
        input.durationMs,
        input.requestId,
        input.ip,
        input.userAgent,
        input.country,
      ],
    );
  }
}
