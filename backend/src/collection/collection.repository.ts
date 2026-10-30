import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';
import { PG_POOL } from '../core/pool.provider';

@Injectable()
export class PostgresCollectionRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable | null) {}

  async countUnverifiedCollections(userId: string): Promise<string> {
    if (!this.pool) throw new Error('database pool unavailable');
    // The app role has no table SELECT. The narrow SECURITY DEFINER function
    // counts only the authenticated actor's unverified legacy records.
    const row = await queryOne<{ count: string }>(
      this.pool,
      'SELECT public.collection_unverified_count($1::uuid) AS count;',
      [userId],
    );
    if (!row || !/^(0|[1-9]\d*)$/.test(row.count)) {
      throw new Error('collection verification metadata unavailable');
    }
    return row.count;
  }
}
