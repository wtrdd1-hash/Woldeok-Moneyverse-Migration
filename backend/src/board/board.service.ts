import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BoardInputError extends Error {}

const uuid = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !UUID.test(value)) throw new BoardInputError(`${field} is invalid`);
  return value.toLowerCase();
};

export function boardText(value: unknown, field: string, max: number, multiline = false): string {
  if (typeof value !== 'string') throw new BoardInputError(`${field} must be text`);
  const text = value.replace(/\r\n?/g, '\n').replace(multiline ? /[\t ]+/g : /\s+/g, ' ').trim();
  if (!text || text.length > max || /[<>\u0000-\u001f\u007f]/.test(text.replace(/\n/g, ''))) throw new BoardInputError(`${field} is invalid`);
  return text;
}

// Raw row shape as returned by the board repository (see
// PostgresBoardRepository, which casts post_id to text and leaves
// created_at as whatever the driver returns for a timestamptz column).
// Fields are kept `unknown` here and pushed through the same validators as
// user input: this function is the last line of defense against a
// corrupted or unexpected database row, not just a formatter.
interface BoardPostRow {
  readonly post_id?: unknown;
  readonly title?: unknown;
  readonly body?: unknown;
  readonly author_name?: unknown;
  readonly created_at?: unknown;
  readonly mine?: unknown;
}

export interface BoardPost {
  readonly postId: string;
  readonly title: string;
  readonly body: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly mine: boolean;
}

function post(row: BoardPostRow): BoardPost {
  const createdAtValue = row?.created_at;
  // Date's constructor overloads accept string | number | Date, not
  // `unknown`; row.created_at is a driver-returned Date in production and a
  // plain ISO string in test doubles, so both are handled explicitly and
  // anything else is treated as the invalid timestamp it would produce.
  const date = typeof createdAtValue === 'string' || typeof createdAtValue === 'number' || createdAtValue instanceof Date
    ? new Date(createdAtValue)
    : new Date(NaN);
  if (Number.isNaN(date.valueOf())) throw new Error('database returned an invalid timestamp');
  return {
    postId: uuid(row?.post_id, 'post id'),
    title: boardText(row?.title, 'title', 120),
    body: boardText(row?.body, 'body', 5000, true),
    authorName: boardText(row?.author_name, 'author name', 120),
    createdAt: date.toISOString(),
    mine: row?.mine === true,
  };
}

export interface BoardRepository {
  list(actorUserId: string, limit: number): Promise<readonly BoardPostRow[]>;
  create(actorUserId: string, title: string, body: string, idempotencyKey: string): Promise<BoardPostRow>;
  remove(actorUserId: string, postId: string, idempotencyKey: string): Promise<boolean>;
}

export interface CreateBoardPostInput {
  readonly title?: unknown;
  readonly body?: unknown;
  readonly idempotencyKey?: unknown;
}

@Injectable()
export class BoardService {
  readonly repository: BoardRepository;

  constructor(repository: BoardRepository) {
    if (!repository || !(['list', 'create', 'remove'] as const).every(name => typeof repository[name] === 'function')) {
      throw new TypeError('board repository is required');
    }
    this.repository = repository;
  }

  async list(userId: unknown): Promise<BoardPost[]> {
    return (await this.repository.list(uuid(userId, 'user id'), 50)).map(post);
  }

  async create(userId: unknown, input?: CreateBoardPostInput): Promise<BoardPost> {
    return post(await this.repository.create(
      uuid(userId, 'user id'),
      boardText(input?.title, 'title', 120),
      boardText(input?.body, 'body', 5000, true),
      uuid(input?.idempotencyKey ?? randomUUID(), 'idempotency key'),
    ));
  }

  async remove(userId: unknown, postId: unknown, idempotencyKey: unknown): Promise<boolean> {
    return this.repository.remove(uuid(userId, 'user id'), uuid(postId, 'post id'), uuid(idempotencyKey, 'idempotency key'));
  }
}
