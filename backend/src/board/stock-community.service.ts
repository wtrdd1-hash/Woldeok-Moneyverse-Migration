import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { boardText } from './board.service';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORAGE_KEY = /^[0-9a-f-]{36}\.(png|jpg|webp)$/;
const STOCK_SYMBOL = /^[A-Za-z0-9._-]{1,16}$/;

export interface StockTaggedPostInput {
  readonly actorUserId: string;
  readonly title: string;
  readonly body: string;
  readonly idempotencyKey: string;
  readonly imageStorageKey?: string;
  readonly imageAltText?: string;
  readonly stockSymbol: string;
  readonly category: 'analysis' | 'question' | 'journal' | 'business' | 'system';
  readonly stance: 'bullish' | 'neutral' | 'bearish' | 'none';
  readonly positionDisclosure: 'holder' | 'no_position' | 'operator_related' | 'undisclosed';
}

interface StockTaggedRow {
  readonly post_id: string;
  readonly title: string;
  readonly body?: string;
  readonly author_name: string;
  readonly created_at: Date | string;
  readonly updated_at: Date | string | null;
  readonly comment_count?: string | number;
  readonly mine: boolean;
  readonly image_storage_key: string | null;
  readonly image_alt_text: string | null;
  readonly primary_stock_id: string | null;
  readonly stock_symbol: string | null;
  readonly stock_name: string | null;
  readonly category: string | null;
  readonly stance: string | null;
  readonly position_disclosure: string | null;
}

function moment(value: Date | string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw new Error('database returned an invalid timestamp');
  return date.toISOString();
}

function optionalMoment(value: Date | string | null): string | null {
  return value === null ? null : moment(value);
}

function count(value: string | number | undefined): number {
  const parsed = Number(value ?? 0);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error('database returned an invalid comment count');
  return parsed;
}

function mapped(row: StockTaggedRow) {
  const stock = row.primary_stock_id === null ? null : {
    stockId: row.primary_stock_id,
    symbol: row.stock_symbol ?? '',
    name: row.stock_name ?? '',
    category: row.category ?? 'general',
    stance: row.stance ?? 'none',
    positionDisclosure: row.position_disclosure ?? 'undisclosed',
  };
  return {
    postId: row.post_id,
    title: boardText(row.title, 'title', 120),
    ...(row.body === undefined ? {} : { body: boardText(row.body, 'body', 5000, true) }),
    authorName: boardText(row.author_name, 'author name', 120),
    createdAt: moment(row.created_at),
    updatedAt: optionalMoment(row.updated_at),
    commentCount: count(row.comment_count),
    mine: row.mine === true,
    hasImage: row.image_storage_key !== null,
    stock,
  };
}

@Injectable()
export class StockCommunityService {
  constructor(private readonly pool: Queryable) {
    if (!pool?.query) throw new TypeError('a PostgreSQL pool is required');
  }

  async create(input: StockTaggedPostInput) {
    if (!UUID.test(input.actorUserId) || !UUID.test(input.idempotencyKey)) throw new Error('invalid board identity');
    if (!STOCK_SYMBOL.test(input.stockSymbol)) throw new Error('invalid stock symbol');
    if (input.imageStorageKey && !STORAGE_KEY.test(input.imageStorageKey)) throw new Error('invalid board image');
    const row = await queryOne<StockTaggedRow>(this.pool,
      `SELECT post_id::text,title,body,author_name,created_at,updated_at,mine,image_storage_key,image_alt_text,
              primary_stock_id::text,stock_symbol,stock_name,category,stance,position_disclosure
         FROM public.member_board_create_stock_tagged($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [input.actorUserId,input.title,input.body,input.idempotencyKey,input.imageStorageKey ?? null,
       input.imageAltText ?? null,input.stockSymbol,input.category,input.stance,input.positionDisclosure],
    );
    if (!row) throw new Error('stock-tagged board post was not returned');
    return mapped(row);
  }

  async publicList(stockSymbol?: string) {
    const normalized = stockSymbol?.trim() || null;
    if (normalized !== null && !STOCK_SYMBOL.test(normalized)) throw new Error('invalid stock symbol');
    const rows = await queryRows<StockTaggedRow>(this.pool,
      `SELECT post_id::text,title,author_name,created_at,updated_at,comment_count,mine,image_storage_key,image_alt_text,
              primary_stock_id::text,stock_symbol,stock_name,category,stance,position_disclosure
         FROM public.member_board_public_list_with_stock($1)
        WHERE $2::text IS NULL OR upper(stock_symbol) = upper($2)`, [50, normalized]);
    return rows.map(mapped);
  }
}
