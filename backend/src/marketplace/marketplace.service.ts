import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import type { MarketplaceQueryDto } from './marketplace.dto';

@Injectable()
export class MarketplaceService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Queryable | null,
  ) {}

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

  // --- Auctions ---
  async listAuctions(): Promise<unknown[]> {
    if (!this.pool) throw new Error('database pool unavailable');
    return queryRows(
      this.pool,
      `SELECT id::text, item_name AS "itemName", item_code AS "itemCode",
              category, rarity, seller_id::text AS "sellerId", seller_name AS "sellerName",
              start_price_wld::text AS "startPriceWld", current_bid_wld::text AS "currentBidWld",
              highest_bidder_id::text AS "highestBidderId", highest_bidder_name AS "highestBidderName",
              bid_count AS "bidCount", buy_now_price_wld::text AS "buyNowPriceWld",
              ends_at::text AS "endsAt", is_extended AS "isExtended", description
       FROM public.marketplace_auctions
       WHERE status = 'ACTIVE'
       ORDER BY ends_at ASC`,
    );
  }

  // Migration 232 mutates account_balances directly without an economy_post_transaction
  // receipt. Until a reviewed forward-only ledger migration is verified, no caller
  // (including proxy bids or internal clients) may enter that SQL function.
  async createAuction(
    _actor: string,
    _dto: {
      itemCode: string;
      itemName: string;
      category: string;
      rarity: string;
      startPriceWld: string;
      buyNowPriceWld?: string;
      durationMinutes?: number;
      description?: string;
    },
  ): Promise<string | null> {
    throw new ServiceUnavailableException('auction ledger settlement is not certified');
  }

  async bidAuction(
    _actor: string,
    _auctionId: string,
    _bidAmountWld: string,
    _maxProxyBidWld?: string,
  ): Promise<unknown> {
    throw new ServiceUnavailableException('auction ledger settlement is not certified');
  }

  // --- Direct P2P Trades ---
  async listTrades(actor: string): Promise<unknown[]> {
    if (!this.pool) throw new Error('database pool unavailable');
    return queryRows(
      this.pool,
      `SELECT id::text, sender_id::text AS "senderId", sender_name AS "senderName",
              recipient_id::text AS "recipientId", recipient_name AS "recipientName",
              offered_items AS "offeredItems", offered_wld::text AS "offeredWld",
              requested_items AS "requestedItems", requested_wld::text AS "requestedWld",
              status, created_at::text AS "createdAt"
       FROM public.marketplace_p2p_trades
       WHERE sender_id = $1::uuid OR recipient_id = $1::uuid
       ORDER BY created_at DESC`,
      [actor],
    );
  }

  async createTrade(
    actor: string,
    dto: {
      recipientName: string;
      offeredItems?: Array<{ name: string; quantity: number; rarity?: string }>;
      offeredWld?: string;
      requestedItems?: Array<{ name: string; quantity: number }>;
      requestedWld?: string;
    },
  ): Promise<string | null> {
    if (!this.pool) throw new Error('database pool unavailable');
    const senderRow = await queryOne<{ name: string }>(
      this.pool,
      `SELECT COALESCE(display_name, '시민') AS name FROM public.users WHERE id = $1::uuid`,
      [actor],
    );
    const senderName = senderRow?.name ?? '시민';

    const targetUser = await queryOne<{ id: string; name: string }>(
      this.pool,
      `SELECT id::text, COALESCE(display_name, username) AS name FROM public.users
       WHERE display_name = $1 OR username = $1 LIMIT 1`,
      [dto.recipientName],
    );

    const recipientId = targetUser?.id ?? actor; // Fallback to actor or target
    const recipientName = targetUser?.name ?? dto.recipientName;

    const row = await queryOne<{ id: string }>(
      this.pool,
      `INSERT INTO public.marketplace_p2p_trades (
         sender_id, sender_name, recipient_id, recipient_name,
         offered_items, offered_wld, requested_items, requested_wld, status
       ) VALUES (
         $1, $2, $3::uuid, $4, $5::jsonb, $6::numeric, $7::jsonb, $8::numeric, 'PROPOSED'
       ) RETURNING id::text`,
      [
        actor,
        senderName,
        recipientId,
        recipientName,
        JSON.stringify(dto.offeredItems ?? []),
        dto.offeredWld || '0',
        JSON.stringify(dto.requestedItems ?? []),
        dto.requestedWld || '0',
      ],
    );
    return row?.id ?? null;
  }

  async acceptTrade(actor: string, tradeId: string): Promise<boolean> {
    if (!this.pool) throw new Error('database pool unavailable');
    const row = await queryOne<{ id: string }>(
      this.pool,
      `UPDATE public.marketplace_p2p_trades
       SET status = 'ACCEPTED_BY_PEER'
       WHERE id = $1::uuid AND (recipient_id = $2::uuid OR sender_id = $2::uuid) AND status = 'PROPOSED'
       RETURNING id::text`,
      [tradeId, actor],
    );
    return !!row?.id;
  }

  async confirmTrade(actor: string, tradeId: string): Promise<boolean> {
    if (!this.pool) throw new Error('database pool unavailable');
    const row = await queryOne<{ id: string }>(
      this.pool,
      `UPDATE public.marketplace_p2p_trades
       SET status = 'COMPLETED', completed_at = clock_timestamp()
       WHERE id = $1::uuid AND (sender_id = $2::uuid OR recipient_id = $2::uuid) AND status = 'ACCEPTED_BY_PEER'
       RETURNING id::text`,
      [tradeId, actor],
    );
    return !!row?.id;
  }

  async cancelTrade(actor: string, tradeId: string): Promise<boolean> {
    if (!this.pool) throw new Error('database pool unavailable');
    const row = await queryOne<{ id: string }>(
      this.pool,
      `UPDATE public.marketplace_p2p_trades
       SET status = 'CANCELLED', cancelled_at = clock_timestamp()
       WHERE id = $1::uuid AND (sender_id = $2::uuid OR recipient_id = $2::uuid) AND status IN ('PROPOSED', 'ACCEPTED_BY_PEER')
       RETURNING id::text`,
      [tradeId, actor],
    );
    return !!row?.id;
  }

  // --- Appraisals ---
  async listAppraisals(actor: string): Promise<unknown[]> {
    if (!this.pool) throw new Error('database pool unavailable');
    return queryRows(
      this.pool,
      `SELECT cert_id AS "certId", item_id AS "itemId", item_name AS "itemName",
              rarity, appraised_value_wld::text AS "appraisedValueWld",
              fair_band_p25::text AS "fairBandP25", fair_band_p75::text AS "fairBandP75",
              provenance_author AS "provenanceAuthor", crafted_at::text AS "craftedAt",
              appraised_at::text AS "appraisedAt", cert_hash AS "certHash"
       FROM public.marketplace_appraisal_certificates
       WHERE user_id = $1::uuid
       ORDER BY appraised_at DESC`,
      [actor],
    );
  }

  async requestAppraisal(
    actor: string,
    dto: { itemId: string; itemName: string; rarity: string },
  ): Promise<unknown> {
    if (!this.pool) throw new Error('database pool unavailable');
    // SECURITY DEFINER function atomically owns journal and certificate.
    // App role cannot directly mutate core money tables or certificates.
    const row = await queryOne<{ cert: unknown }>(
      this.pool,
      `SELECT public.marketplace_create_appraisal_certificate(
         $1::uuid, $2::text, $3::text, $4::text
       ) AS cert`,
      [actor, dto.itemId, dto.itemName, dto.rarity],
    );
    return row?.cert ?? null;
  }
}
