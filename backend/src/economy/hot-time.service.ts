import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryRows } from '../core/db';
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

    if (!this.pool) throw new ServiceUnavailableException('Hot-time evidence is unavailable');

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
         WHERE active = true AND starts_at <= NOW() AND ends_at > NOW()
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
      throw new ServiceUnavailableException('Hot-time evidence is unavailable');
    }
  }

  async toggleHotTime(_buffKey: string, _active: boolean): Promise<HotTimeBuffItem | null> {
    // A direct UPDATE is not a safe administrative contract; hold writes until a
    // privileged SQL function, recent reauthentication, and audit are verified.
    throw new ServiceUnavailableException('Hot-time changes are disabled pending security verification');
  }
}
