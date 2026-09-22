import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import type { MarketplaceQueryDto } from './marketplace.dto';

@Injectable()
export class MarketplaceService {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable | null) {}

  async listListings(query: MarketplaceQueryDto): Promise<unknown[]> {
    if (!this.pool) throw new Error('database pool unavailable');
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;
    const category = query.category || null;
    const search = query.search ? `%${query.search}%` : null;

    return queryRows(
      this.pool,
      `SELECT id::text, seller_id::text, item_code, item_name, category,
              rarity, quantity, price_wld::text, listing_fee_wld::text,
              status, description, created_at
       FROM public.marketplace_listings
       WHERE status = 'ACTIVE'
         AND ($1::text IS NULL OR category = $1)
         AND ($2::text IS NULL OR item_name ILIKE $2 OR description ILIKE $2)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [category, search, limit, offset],
    );
  }

  async listMyListings(actor: string): Promise<unknown[]> {
    if (!this.pool) throw new Error('database pool unavailable');
    return queryRows(
      this.pool,
      `SELECT id::text, seller_id::text, item_code, item_name, category,
              rarity, quantity, price_wld::text, listing_fee_wld::text,
              status, description, created_at, settled_at, cancelled_at
       FROM public.marketplace_listings
       WHERE seller_id = $1
       ORDER BY created_at DESC`,
      [actor],
    );
  }

  async createListing(
    actor: string,
    itemCode: string,
    quantity: number,
    priceStr: string,
    key: string,
    description?: string,
  ): Promise<string | null> {
    if (!this.pool) throw new Error('database pool unavailable');
    const row = await queryOne<{ listing_id: string }>(
      this.pool,
      `SELECT public.marketplace_create_listing($1, $2, $3, $4, $5, $6) AS listing_id`,
      [actor, itemCode, quantity, priceStr, key, description || ''],
    );
    return row?.listing_id ?? null;
  }

  async buyListing(actor: string, listingId: string, key: string): Promise<string | null> {
    if (!this.pool) throw new Error('database pool unavailable');
    const row = await queryOne<{ tx_id: string }>(
      this.pool,
      `SELECT public.marketplace_buy_listing($1, $2, $3) AS tx_id`,
      [actor, listingId, key],
    );
    return row?.tx_id ?? null;
  }

  async cancelListing(actor: string, listingId: string): Promise<boolean> {
    if (!this.pool) throw new Error('database pool unavailable');
    const row = await queryOne<{ success: boolean }>(
      this.pool,
      `SELECT public.marketplace_cancel_listing($1, $2) AS success`,
      [actor, listingId],
    );
    return row?.success ?? false;
  }
}
