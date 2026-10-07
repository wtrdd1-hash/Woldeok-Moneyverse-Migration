import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryRows, queryOne } from '../core/db';
import { PG_POOL } from '../core/pool.provider';

export interface HotTimeBuffItem {
  readonly id: string;
  readonly buffKey: string;
  readonly title: string;
  readonly description: string;
  readonly multiplier: number;
  readonly targetDomain: string;
  readonly active: boolean;
  readonly startsAt: string;
  readonly endsAt: string;
}

export interface HotTimePayload {
  readonly activeBuffs: readonly HotTimeBuffItem[];
  readonly hasActiveHotTime: boolean;
  readonly serverTime: string;
}

@Injectable()
export class HotTimeService {
  private readonly logger = new Logger(HotTimeService.name);

  constructor(@Inject(PG_POOL) private readonly pool: Queryable | null) {}

  async getActiveHotTimes(): Promise<HotTimePayload> {
    const now = new Date().toISOString();

    if (!this.pool) {
      return {
        activeBuffs: [],
        hasActiveHotTime: false,
        serverTime: now,
      };
    }

    try {
      const rows = await queryRows<{
        id: string;
        buff_key: string;
        title: string;
        description: string;
        multiplier: string;
        target_domain: string;
        active: boolean;
        starts_at: Date;
        ends_at: Date;
      }>(
        this.pool,
        `SELECT id::text, buff_key, title, description, multiplier::text, target_domain, active, starts_at, ends_at
         FROM public.economic_hot_time_events
         WHERE active = true AND ends_at > NOW()
         ORDER BY starts_at ASC;`
      );

      const items: HotTimeBuffItem[] = rows.map((r) => ({
        id: r.id,
        buffKey: r.buff_key,
        title: r.title,
        description: r.description,
        multiplier: Number(r.multiplier),
        targetDomain: r.target_domain,
        active: r.active,
        startsAt: r.starts_at.toISOString(),
        endsAt: r.ends_at.toISOString(),
      }));

      return {
        activeBuffs: items,
        hasActiveHotTime: items.length > 0,
        serverTime: now,
      };
    } catch (err) {
      this.logger.error('Failed to query economic_hot_time_events', err);
      return {
        activeBuffs: [],
        hasActiveHotTime: false,
        serverTime: now,
      };
    }
  }

  async toggleHotTime(buffKey: string, active: boolean): Promise<HotTimeBuffItem | null> {
    if (!this.pool) return null;

    try {
      const row = await queryOne<{
        id: string;
        buff_key: string;
        title: string;
        description: string;
        multiplier: string;
        target_domain: string;
        active: boolean;
        starts_at: Date;
        ends_at: Date;
      }>(
        this.pool,
        `UPDATE public.economic_hot_time_events
         SET active = $2
         WHERE buff_key = $1
         RETURNING id::text, buff_key, title, description, multiplier::text, target_domain, active, starts_at, ends_at;`,
        [buffKey, active]
      );

      if (!row) return null;

      return {
        id: row.id,
        buffKey: row.buff_key,
        title: row.title,
        description: row.description,
        multiplier: Number(row.multiplier),
        targetDomain: row.target_domain,
        active: row.active,
        startsAt: row.starts_at.toISOString(),
        endsAt: row.ends_at.toISOString(),
      };
    } catch (err) {
      this.logger.error(`Failed to toggle hot time buff ${buffKey}`, err);
      return null;
    }
  }
}
