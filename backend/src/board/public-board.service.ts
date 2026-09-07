import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { boardText } from './board.service';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORAGE_KEY = /^[0-9a-f-]{36}\.(png|jpg|webp)$/;

interface SummaryRow {
  readonly post_id: string;
  readonly title: string;
  readonly author_name: string;
  readonly created_at: Date | string;
  readonly updated_at: Date | string | null;
  readonly comment_count: string | number;
  readonly mine: boolean;
  readonly image_storage_key: string | null;
  readonly image_alt_text: string | null;
}

interface PostRow {
  readonly post_id: string;
  readonly title: string;
  readonly body: string;
  readonly author_name: string;
  readonly created_at: Date | string;
  readonly updated_at: Date | string | null;
  readonly mine: boolean;
  readonly image_storage_key: string | null;
  readonly image_alt_text: string | null;
}

interface CommentRow {
  readonly comment_id: string;
  readonly body: string;
  readonly author_name: string;
  readonly created_at: Date | string;
  readonly mine: boolean;
}

export interface PublicBoardPostSummary {
  readonly postId: string;
  readonly title: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
  readonly commentCount: number;
  readonly mine: false;
  readonly hasImage: boolean;
}

export interface PublicBoardPost {
  readonly postId: string;
  readonly title: string;
  readonly body: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
  readonly mine: false;
  readonly imageUrl: string | null;
  readonly imageAltText: string | null;
}

export interface PublicBoardComment {
  readonly commentId: string;
  readonly body: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly mine: false;
}

function uuid(value: unknown, field: string): string {
  if (typeof value !== 'string' || !UUID.test(value)) throw new Error(`database returned invalid ${field}`);
  return value.toLowerCase();
}

function moment(value: unknown): string {
  const date = typeof value === 'string' || value instanceof Date ? new Date(value) : new Date(NaN);
  if (Number.isNaN(date.valueOf())) throw new Error('database returned an invalid timestamp');
  return date.toISOString();
}

function optionalMoment(value: unknown): string | null {
  return value === null || value === undefined ? null : moment(value);
}

function count(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error('database returned an invalid comment count');
  return parsed;
}

function image(row: Pick<PostRow, 'image_storage_key' | 'image_alt_text'>): {
  readonly imageUrl: string | null;
  readonly imageAltText: string | null;
} {
  if (row.image_storage_key === null) {
    if (row.image_alt_text !== null) throw new Error('database returned an inconsistent board image');
    return { imageUrl: null, imageAltText: null };
  }
  if (!STORAGE_KEY.test(row.image_storage_key) || row.image_alt_text === null) {
    throw new Error('database returned an invalid board image');
  }
  return {
    imageUrl: `/media/board/${row.image_storage_key}`,
    imageAltText: boardText(row.image_alt_text, 'image alt text', 300),
  };
}

@Injectable()
export class PublicBoardService {
  constructor(private readonly pool: Queryable) {
    if (!pool?.query) throw new TypeError('a PostgreSQL pool is required');
  }

  async list(): Promise<PublicBoardPostSummary[]> {
    const rows = await queryRows<SummaryRow>(
      this.pool,
      `SELECT post_id::text,title,author_name,created_at,updated_at,comment_count,mine,image_storage_key,image_alt_text
         FROM public.member_board_public_list($1)`,
      [50],
    );
    return rows.map((row) => ({
      postId: uuid(row.post_id, 'post id'),
      title: boardText(row.title, 'title', 120),
      authorName: boardText(row.author_name, 'author name', 120),
      createdAt: moment(row.created_at),
      updatedAt: optionalMoment(row.updated_at),
      commentCount: count(row.comment_count),
      mine: false,
      hasImage: row.image_storage_key !== null,
    }));
  }

  async get(postId: string): Promise<PublicBoardPost | null> {
    if (!UUID.test(postId)) return null;
    const row = await queryOne<PostRow>(
      this.pool,
      `SELECT post_id::text,title,body,author_name,created_at,updated_at,mine,image_storage_key,image_alt_text
         FROM public.member_board_public_get($1)`,
      [postId],
    );
    if (!row) return null;
    return {
      postId: uuid(row.post_id, 'post id'),
      title: boardText(row.title, 'title', 120),
      body: boardText(row.body, 'body', 5000, true),
      authorName: boardText(row.author_name, 'author name', 120),
      createdAt: moment(row.created_at),
      updatedAt: optionalMoment(row.updated_at),
      mine: false,
      ...image(row),
    };
  }

  async comments(postId: string): Promise<PublicBoardComment[]> {
    if (!UUID.test(postId)) return [];
    const rows = await queryRows<CommentRow>(
      this.pool,
      `SELECT comment_id::text,body,author_name,created_at,mine
         FROM public.member_board_public_comment_list($1,$2)`,
      [postId, 200],
    );
    return rows.map((row) => ({
      commentId: uuid(row.comment_id, 'comment id'),
      body: boardText(row.body, 'comment', 1000),
      authorName: boardText(row.author_name, 'author name', 120),
      createdAt: moment(row.created_at),
      mine: false,
    }));
  }

  async imageVisible(storageKey: string): Promise<boolean> {
    if (!STORAGE_KEY.test(storageKey)) return false;
    const row = await queryOne<{ readonly visible: boolean }>(
      this.pool,
      'SELECT public.member_board_public_image_visible($1) AS visible',
      [storageKey],
    );
    return row?.visible === true;
  }
}
