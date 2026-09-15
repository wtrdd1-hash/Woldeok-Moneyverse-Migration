import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';

export interface ServerGameClockRow {
  readonly policy_version: string;
  readonly day_index: string;
  readonly week_index: string;
  readonly day_of_week: number;
  readonly real_seconds_per_day: number;
  readonly game_days_per_week: number;
  readonly day_started_at: Date;
  readonly day_ends_at: Date;
  readonly week_started_at: Date;
  readonly week_ends_at: Date;
}

export class GameClockRepository {
  constructor(private readonly pool: Queryable) {}
  async current(): Promise<ServerGameClockRow> {
    const row = await queryOne<ServerGameClockRow>(this.pool, `
      SELECT clock.policy_version, clock.day_index::text AS day_index,
             clock.week_index::text AS week_index, clock.day_of_week,
             clock.real_seconds_per_day, clock.game_days_per_week,
             clock.day_started_at, clock.day_ends_at,
             clock.week_started_at, clock.week_ends_at
      FROM public.server_game_clock() AS clock`);
    if (!row) throw new Error('server_game_clock did not return a row');
    return row;
  }
}
