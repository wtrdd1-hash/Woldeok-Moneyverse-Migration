import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import type { BoardRepository } from './board.service';

// Raw rows returned by the member_board_* functions (see
// 044-member-board.sql and 048-member-board-threads.sql). Ids are cast to
// text by the SQL below; timestamps are timestamptz, returned by the driver
// as Date; `mine` is computed in SQL as a boolean. board.service.ts
// re-validates every field through the same helpers as user input before
// exposing it, so these types are only an assertion about what the driver
// hands back, not a trust boundary.

/** A row of the list. No body: the list does not render one. */
export interface BoardPostSummaryRow {
  readonly post_id: string;
  readonly title: string;
  readonly author_name: string;
  readonly created_at: Date;
  readonly updated_at: Date | null;
  /** bigint, which node-postgres hands back as a string. */
  readonly comment_count: string;
  readonly mine: boolean;
  readonly image_storage_key: string | null;
  readonly image_alt_text: string | null;
}

export interface BoardPostRow {
  readonly post_id: string;
  readonly title: string;
  readonly body: string;
  readonly author_name: string;
  readonly created_at: Date;
  readonly updated_at: Date | null;
  readonly mine: boolean;
  readonly image_storage_key: string | null;
  readonly image_alt_text: string | null;
}

export interface BoardCommentRow {
  readonly comment_id: string;
  readonly body: string;
  readonly author_name: string;
  readonly created_at: Date;
  readonly mine: boolean;
}

interface DeletedRow {
  readonly deleted: boolean;
}

const SUMMARY_COLUMNS =
  'post_id::text,title,author_name,created_at,updated_at,comment_count,mine,image_storage_key,image_alt_text';
const POST_COLUMNS =
  'post_id::text,title,body,author_name,created_at,updated_at,mine,image_storage_key,image_alt_text';
const COMMENT_COLUMNS = 'comment_id::text,body,author_name,created_at,mine';

export class PostgresBoardRepository implements BoardRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    if (!pool?.query) throw new TypeError('a PostgreSQL pool is required');
    this.pool = pool;
  }

  async list(actorUserId: string, limit: number): Promise<readonly BoardPostSummaryRow[]> {
    return queryRows<BoardPostSummaryRow>(
      this.pool,
      `SELECT ${SUMMARY_COLUMNS} FROM public.member_board_list($1,$2)`,
      [actorUserId, limit],
    );
  }

  async get(actorUserId: string, postId: string): Promise<BoardPostRow | null> {
    return queryOne<BoardPostRow>(
      this.pool,
      `SELECT ${POST_COLUMNS} FROM public.member_board_get($1,$2)`,
      [actorUserId, postId],
    );
  }

  async create(
    actorUserId: string,
    title: string,
    body: string,
    idempotencyKey: string,
    imageStorageKey: string | null,
    imageAltText: string | null,
  ): Promise<BoardPostRow> {
    const row = await queryOne<BoardPostRow>(
      this.pool,
      `SELECT ${POST_COLUMNS} FROM public.member_board_create_with_image($1,$2,$3,$4,$5,$6)`,
      [actorUserId, title, body, idempotencyKey, imageStorageKey, imageAltText],
    );
    if (!row) throw new Error('board did not return a post');
    return row;
  }

  async update(
    actorUserId: string,
    postId: string,
    title: string,
    body: string,
    idempotencyKey: string,
  ): Promise<BoardPostRow | null> {
    return queryOne<BoardPostRow>(
      this.pool,
      `SELECT ${POST_COLUMNS} FROM public.member_board_update($1,$2,$3,$4,$5)`,
      [actorUserId, postId, title, body, idempotencyKey],
    );
  }

  async remove(actorUserId: string, postId: string, idempotencyKey: string): Promise<boolean> {
    const row = await queryOne<DeletedRow>(
      this.pool,
      'SELECT public.member_board_delete($1,$2,$3) AS deleted',
      [actorUserId, postId, idempotencyKey],
    );
    return row?.deleted === true;
  }

  async listComments(
    actorUserId: string,
    postId: string,
    limit: number,
  ): Promise<readonly BoardCommentRow[]> {
    return queryRows<BoardCommentRow>(
      this.pool,
      `SELECT ${COMMENT_COLUMNS} FROM public.member_board_comment_list($1,$2,$3)`,
      [actorUserId, postId, limit],
    );
  }

  async createComment(
    actorUserId: string,
    postId: string,
    body: string,
    idempotencyKey: string,
  ): Promise<BoardCommentRow> {
    const row = await queryOne<BoardCommentRow>(
      this.pool,
      `SELECT ${COMMENT_COLUMNS} FROM public.member_board_comment_create($1,$2,$3,$4)`,
      [actorUserId, postId, body, idempotencyKey],
    );
    if (!row) throw new Error('board did not return a comment');
    return row;
  }

  async registerImageUpload(actorUserId: string, storageKey: string): Promise<boolean> {
    const row = await queryOne<{ readonly registered: boolean }>(
      this.pool,
      'SELECT public.member_board_register_image_upload($1,$2) AS registered',
      [actorUserId, storageKey],
    );
    return row?.registered === true;
  }

  async imageVisible(actorUserId: string, storageKey: string): Promise<boolean> {
    const row = await queryOne<{ readonly visible: boolean }>(
      this.pool,
      'SELECT public.member_board_image_visible($1,$2) AS visible',
      [actorUserId, storageKey],
    );
    return row?.visible === true;
  }

  async removeComment(
    actorUserId: string,
    commentId: string,
    idempotencyKey: string,
  ): Promise<boolean> {
    const row = await queryOne<DeletedRow>(
      this.pool,
      'SELECT public.member_board_comment_delete($1,$2,$3) AS deleted',
      [actorUserId, commentId, idempotencyKey],
    );
    return row?.deleted === true;
  }
}
