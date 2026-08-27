import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import type { BoardRepository } from './board.service';

// Raw rows returned by member_board_list()/member_board_create() (see
// migration 044-member-board.sql). post_id is cast to text by the SQL below;
// created_at is a timestamptz, returned by the driver as a Date; mine is
// computed in SQL as a boolean. board-service.ts re-validates every field
// through the same helpers as user input before exposing it, so this type is
// only an assertion about what the driver hands back, not a trust boundary.
export interface BoardPostRow {
  readonly post_id: string;
  readonly title: string;
  readonly body: string;
  readonly author_name: string;
  readonly created_at: Date;
  readonly mine: boolean;
}

interface DeletedRow {
  readonly deleted: boolean;
}

export class PostgresBoardRepository implements BoardRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    if (!pool?.query) throw new TypeError('a PostgreSQL pool is required');
    this.pool = pool;
  }

  async list(actorUserId: string, limit: number): Promise<readonly BoardPostRow[]> {
    return queryRows<BoardPostRow>(
      this.pool,
      'SELECT post_id::text,title,body,author_name,created_at,mine FROM public.member_board_list($1,$2)',
      [actorUserId, limit],
    );
  }

  async create(
    actorUserId: string,
    title: string,
    body: string,
    idempotencyKey: string,
  ): Promise<BoardPostRow> {
    const row = await queryOne<BoardPostRow>(
      this.pool,
      'SELECT post_id::text,title,body,author_name,created_at,mine FROM public.member_board_create($1,$2,$3,$4)',
      [actorUserId, title, body, idempotencyKey],
    );
    if (!row) throw new Error('board did not return a post');
    return row;
  }

  async remove(actorUserId: string, postId: string, idempotencyKey: string): Promise<boolean> {
    const row = await queryOne<DeletedRow>(
      this.pool,
      'SELECT public.member_board_delete($1,$2,$3) AS deleted',
      [actorUserId, postId, idempotencyKey],
    );
    return row?.deleted === true;
  }
}
