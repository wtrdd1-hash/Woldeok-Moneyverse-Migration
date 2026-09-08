import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORAGE_KEY = /^[0-9a-f-]{36}\.(png|jpg|webp)$/;

export class BoardInputError extends Error {}

const uuid = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !UUID.test(value))
    throw new BoardInputError(`${field} is invalid`);
  return value.toLowerCase();
};

export function boardText(value: unknown, field: string, max: number, multiline = false): string {
  if (typeof value !== 'string') throw new BoardInputError(`${field} must be text`);
  const text = value
    .replace(/\r\n?/g, '\n')
    .replace(multiline ? /[\t ]+/g : /\s+/g, ' ')
    .trim();
  if (!text || text.length > max || /[<>\u0000-\u001f\u007f]/.test(text.replace(/\n/g, '')))
    throw new BoardInputError(`${field} is invalid`);
  return text;
}
// Raw row shapes as returned by the board repository, which casts ids to text
// and leaves timestamps as whatever the driver returns for a timestamptz
// column. Fields are kept `unknown` here and pushed through the same
// validators as user input: these functions are the last line of defense
// against a corrupted or unexpected database row, not just formatters.
interface BoardPostSummaryRow {
  readonly post_id?: unknown;
  readonly title?: unknown;
  readonly author_name?: unknown;
  readonly created_at?: unknown;
  readonly updated_at?: unknown;
  readonly comment_count?: unknown;
  readonly mine?: unknown;
  readonly image_storage_key?: unknown;
  readonly image_alt_text?: unknown;
}

interface BoardPostRow {
  readonly post_id?: unknown;
  readonly title?: unknown;
  readonly body?: unknown;
  readonly author_name?: unknown;
  readonly created_at?: unknown;
  readonly updated_at?: unknown;
  readonly mine?: unknown;
  readonly image_storage_key?: unknown;
  readonly image_alt_text?: unknown;
}

interface BoardCommentRow {
  readonly comment_id?: unknown;
  readonly body?: unknown;
  readonly author_name?: unknown;
  readonly created_at?: unknown;
  readonly mine?: unknown;
}

export interface BoardPostSummary {
  readonly postId: string;
  readonly title: string;
  readonly authorName: string;
  readonly createdAt: string;
  /** Null until the author edits it. */
  readonly updatedAt: string | null;
  readonly commentCount: number;
  readonly mine: boolean;
  readonly hasImage: boolean;
}

export interface BoardPost {
  readonly postId: string;
  readonly title: string;
  readonly body: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
  readonly mine: boolean;
  readonly imageUrl: string | null;
  readonly imageAltText: string | null;
}

export interface BoardComment {
  readonly commentId: string;
  readonly body: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly mine: boolean;
}

/**
 * Date's constructor overloads accept string | number | Date, not `unknown`.
 * A timestamptz is a driver-returned Date in production and a plain ISO
 * string in test doubles, so both are handled explicitly and anything else is
 * treated as the invalid timestamp it would produce.
 */
function moment(value: unknown): string {
  const date =
    typeof value === 'string' || typeof value === 'number' || value instanceof Date
      ? new Date(value)
      : new Date(NaN);
  if (Number.isNaN(date.valueOf())) throw new Error('database returned an invalid timestamp');
  return date.toISOString();
}

/** `updated_at` is null for a post nobody has edited, which is not an error. */
function optionalMoment(value: unknown): string | null {
  return value === null || value === undefined ? null : moment(value);
}

/**
 * `comment_count` is a bigint, which node-postgres hands back as a string
 * rather than a number — there are bigints it cannot represent. A reply count
 * is not one of them, so it is narrowed here after being checked, and a value
 * that is not a whole count means a corrupted row.
 */
function count(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error('database returned an invalid comment count');
  }
  return parsed;
}

function boardImage(row: {
  readonly image_storage_key?: unknown;
  readonly image_alt_text?: unknown;
}): {
  readonly imageUrl: string | null;
  readonly imageAltText: string | null;
} {
  const key = row.image_storage_key;
  const alt = row.image_alt_text;
  if (key === null || key === undefined) {
    if (alt !== null && alt !== undefined)
      throw new Error('database returned an inconsistent board image');
    return { imageUrl: null, imageAltText: null };
  }
  if (typeof key !== 'string' || !STORAGE_KEY.test(key)) {
    throw new Error('database returned an invalid board image key');
  }
  return { imageUrl: `/media/board/${key}`, imageAltText: boardText(alt, 'image alt text', 300) };
}

function optionalImageInput(
  storageKey: unknown,
  altText: unknown,
): { storageKey: string | null; altText: string | null } {
  const noKey = storageKey === null || storageKey === undefined || storageKey === '';
  const noAlt = altText === null || altText === undefined || altText === '';
  if (noKey && noAlt) return { storageKey: null, altText: null };
  if (noKey || noAlt || typeof storageKey !== 'string' || !STORAGE_KEY.test(storageKey)) {
    throw new BoardInputError('board image is invalid');
  }
  return { storageKey, altText: boardText(altText, 'image alt text', 300) };
}

function summary(row: BoardPostSummaryRow): BoardPostSummary {
  return {
    postId: uuid(row?.post_id, 'post id'),
    title: boardText(row?.title, 'title', 120),
    authorName: boardText(row?.author_name, 'author name', 120),
    createdAt: moment(row?.created_at),
    updatedAt: optionalMoment(row?.updated_at),
    commentCount: count(row?.comment_count),
    mine: row?.mine === true,
    hasImage: row?.image_storage_key !== null && row?.image_storage_key !== undefined,
  };
}

function post(row: BoardPostRow): BoardPost {
  const image = boardImage(row);
  return {
    postId: uuid(row?.post_id, 'post id'),
    title: boardText(row?.title, 'title', 120),
    body: boardText(row?.body, 'body', 5000, true),
    authorName: boardText(row?.author_name, 'author name', 120),
    createdAt: moment(row?.created_at),
    updatedAt: optionalMoment(row?.updated_at),
    mine: row?.mine === true,
    ...image,
  };
}

function comment(row: BoardCommentRow): BoardComment {
  return {
    commentId: uuid(row?.comment_id, 'comment id'),
    body: boardText(row?.body, 'comment', 1000),
    authorName: boardText(row?.author_name, 'author name', 120),
    createdAt: moment(row?.created_at),
    mine: row?.mine === true,
  };
}

export interface BoardRepository {
  list(actorUserId: string, limit: number): Promise<readonly BoardPostSummaryRow[]>;
  get(actorUserId: string, postId: string): Promise<BoardPostRow | null>;
  create(
    actorUserId: string,
    title: string,
    body: string,
    idempotencyKey: string,
    imageStorageKey: string | null,
    imageAltText: string | null,
  ): Promise<BoardPostRow>;
  update(
    actorUserId: string,
    postId: string,
    title: string,
    body: string,
    idempotencyKey: string,
  ): Promise<BoardPostRow | null>;
  remove(actorUserId: string, postId: string, idempotencyKey: string): Promise<boolean>;
  listComments(
    actorUserId: string,
    postId: string,
    limit: number,
  ): Promise<readonly BoardCommentRow[]>;
  createComment(
    actorUserId: string,
    postId: string,
    body: string,
    idempotencyKey: string,
  ): Promise<BoardCommentRow>;
  removeComment(actorUserId: string, commentId: string, idempotencyKey: string): Promise<boolean>;
  imageVisible(actorUserId: string, storageKey: string): Promise<boolean>;
  registerImageUpload(actorUserId: string, storageKey: string): Promise<boolean>;
}

export interface CreateBoardPostInput {
  readonly title?: unknown;
  readonly body?: unknown;
  readonly idempotencyKey?: unknown;
  readonly imageStorageKey?: unknown;
  readonly imageAltText?: unknown;
}

export interface CreateBoardCommentInput {
  readonly body?: unknown;
  readonly idempotencyKey?: unknown;
}

const REQUIRED = [
  'list',
  'get',
  'create',
  'update',
  'remove',
  'listComments',
  'createComment',
  'removeComment',
  'imageVisible',
  'registerImageUpload',
] as const;

@Injectable()
export class BoardService {
  readonly repository: BoardRepository;

  constructor(repository: BoardRepository) {
    if (!repository || !REQUIRED.every((name) => typeof repository[name] === 'function')) {
      throw new TypeError('board repository is required');
    }
    this.repository = repository;
  }

  async list(userId: unknown): Promise<BoardPostSummary[]> {
    return (await this.repository.list(uuid(userId, 'user id'), 50)).map(summary);
  }

  /** Null for a post that does not exist or was deleted. The route answers 404. */
  async get(userId: unknown, postId: unknown): Promise<BoardPost | null> {
    const row = await this.repository.get(uuid(userId, 'user id'), uuid(postId, 'post id'));
    return row ? post(row) : null;
  }

  async create(userId: unknown, input?: CreateBoardPostInput): Promise<BoardPost> {
    const image = optionalImageInput(input?.imageStorageKey, input?.imageAltText);
    return post(
      await this.repository.create(
        uuid(userId, 'user id'),
        boardText(input?.title, 'title', 120),
        boardText(input?.body, 'body', 5000, true),
        uuid(input?.idempotencyKey ?? randomUUID(), 'idempotency key'),
        image.storageKey,
        image.altText,
      ),
    );
  }

  /** Null when the post is not the caller's, which the route answers as 404. */
  async update(
    userId: unknown,
    postId: unknown,
    input?: CreateBoardPostInput,
  ): Promise<BoardPost | null> {
    const row = await this.repository.update(
      uuid(userId, 'user id'),
      uuid(postId, 'post id'),
      boardText(input?.title, 'title', 120),
      boardText(input?.body, 'body', 5000, true),
      uuid(input?.idempotencyKey ?? randomUUID(), 'idempotency key'),
    );
    return row ? post(row) : null;
  }

  async remove(userId: unknown, postId: unknown, idempotencyKey: unknown): Promise<boolean> {
    return this.repository.remove(
      uuid(userId, 'user id'),
      uuid(postId, 'post id'),
      uuid(idempotencyKey, 'idempotency key'),
    );
  }

  async listComments(userId: unknown, postId: unknown): Promise<BoardComment[]> {
    return (
      await this.repository.listComments(uuid(userId, 'user id'), uuid(postId, 'post id'), 200)
    ).map(comment);
  }

  async createComment(
    userId: unknown,
    postId: unknown,
    input?: CreateBoardCommentInput,
  ): Promise<BoardComment> {
    return comment(
      await this.repository.createComment(
        uuid(userId, 'user id'),
        uuid(postId, 'post id'),
        // Single line on purpose: the column rejects control characters, so a
        // newline typed into the reply box is folded to a space here rather
        // than refused by the database as an unexplained bad request.
        boardText(input?.body, 'comment', 1000),
        uuid(input?.idempotencyKey ?? randomUUID(), 'idempotency key'),
      ),
    );
  }

  async imageVisible(userId: unknown, storageKey: unknown): Promise<boolean> {
    if (typeof storageKey !== 'string' || !STORAGE_KEY.test(storageKey)) return false;
    return this.repository.imageVisible(uuid(userId, 'user id'), storageKey);
  }

  async registerImageUpload(userId: unknown, storageKey: unknown): Promise<boolean> {
    if (typeof storageKey !== 'string' || !STORAGE_KEY.test(storageKey)) {
      throw new BoardInputError('board image is invalid');
    }
    return this.repository.registerImageUpload(uuid(userId, 'user id'), storageKey);
  }

  async removeComment(
    userId: unknown,
    commentId: unknown,
    idempotencyKey: unknown,
  ): Promise<boolean> {
    return this.repository.removeComment(
      uuid(userId, 'user id'),
      uuid(commentId, 'comment id'),
      uuid(idempotencyKey, 'idempotency key'),
    );
  }
}
