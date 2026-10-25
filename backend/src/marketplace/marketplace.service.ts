import { Inject, Injectable, Optional, ServiceUnavailableException } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import type { MarketplaceQueryDto } from './marketplace.dto';
import { AuctionGateway } from './auction.gateway';

@Injectable()
export class MarketplaceService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Queryable | null,
    @Optional() @Inject(AuctionGateway) private readonly auctionGateway?: AuctionGateway,
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

  async createAuction(
    actor: string,
    dto: {
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
    if (!this.pool) throw new Error('database pool unavailable');
    const duration = dto.durationMinutes ?? 45;
    const row = await queryOne<{ id: string }>(
      this.pool,
      `INSERT INTO public.marketplace_auctions (
         seller_id, seller_name, item_code, item_name, category, rarity,
         start_price_wld, current_bid_wld, buy_now_price_wld, ends_at, description
       ) VALUES (
         $1, (SELECT COALESCE(display_name, '시민') FROM public.users WHERE id = $1::uuid),
         $2, $3, $4, $5, $6::numeric, $6::numeric, $7::numeric,
         clock_timestamp() + ($8 || ' minutes')::interval, $9
       ) RETURNING id::text`,
      [
        actor,
        dto.itemCode,
        dto.itemName,
        dto.category,
        dto.rarity,
        dto.startPriceWld,
        dto.buyNowPriceWld || null,
        duration,
        dto.description || '',
      ],
    );
    return row?.id ?? null;
  }

  private readonly proxyBids = new Map<
    string,
    { userId: string; userName: string; maxBid: number; isPlusUser: boolean }
  >();

  async bidAuction(actor: string, auctionId: string, bidAmountWld: string, maxProxyBidWld?: string): Promise<unknown> {
    if (!this.pool) throw new Error('database pool unavailable');
    const userRow = await queryOne<{ name: string; is_plus_user?: boolean }>(
      this.pool,
      `SELECT COALESCE(display_name, '시민') AS name, true as is_plus_user FROM public.users WHERE id = $1::uuid`,
      [actor],
    );
    const actorName = userRow?.name ?? '시민';
    const isPlusUser = userRow?.is_plus_user ?? true;
    const burnFeePercent = isPlusUser ? 2.5 : 5.0;

    // Check anti-sniping (if ends in < 60s, extend by 2 minutes)
    const auctionRow = await queryOne<{
      item_name: string;
      rarity: string;
      seconds_left: number;
      highest_bidder_id: string | null;
      highest_bidder_name: string | null;
      current_bid_wld: string;
    }>(
      this.pool,
      `SELECT item_name, rarity, EXTRACT(EPOCH FROM (ends_at - clock_timestamp())) AS seconds_left,
              highest_bidder_id::text, highest_bidder_name, current_bid_wld::text
       FROM public.marketplace_auctions
       WHERE id = $1::uuid AND status = 'ACTIVE'`,
      [auctionId],
    );

    let extended = false;
    let newEndsAt: string | null = null;
    if (auctionRow && auctionRow.seconds_left > 0 && auctionRow.seconds_left < 60) {
      const extRow = await queryOne<{ new_ends_at: string }>(
        this.pool,
        `UPDATE public.marketplace_auctions
         SET ends_at = clock_timestamp() + interval '2 minutes', is_extended = true
         WHERE id = $1::uuid
         RETURNING ends_at::text as new_ends_at`,
        [auctionId],
      );
      if (extRow?.new_ends_at) {
        extended = true;
        newEndsAt = extRow.new_ends_at;
      }
    }

    const previousHighestBidderId = auctionRow?.highest_bidder_id;
    const previousHighestBidderName = auctionRow?.highest_bidder_name;

    const row = await queryOne<{ res: unknown }>(
      this.pool,
      `SELECT public.marketplace_bid_auction($1, $2, $3, $4) AS res`,
      [actor, actorName, auctionId, bidAmountWld],
    );

    // Save or update caller's proxy bid if provided
    const requestedAmount = Number(bidAmountWld) || 0;
    if (maxProxyBidWld && Number(maxProxyBidWld) > requestedAmount) {
      this.proxyBids.set(auctionId, {
        userId: actor,
        userName: actorName,
        maxBid: Number(maxProxyBidWld),
        isPlusUser,
      });
    }

    // Broadcast primary WebSocket events
    if (this.auctionGateway) {
      this.auctionGateway.broadcastBid({
        id: `bid-${Date.now()}`,
        auctionId,
        itemTitle: auctionRow?.item_name || '경매 아티팩트',
        itemRarity: auctionRow?.rarity || 'epic',
        bidAmount: requestedAmount,
        bidderName: actorName,
        isPlusUser,
        burnFeePercent,
        timestamp: new Date().toISOString(),
      });

      if (previousHighestBidderId && previousHighestBidderId !== actor) {
        this.auctionGateway.broadcastOutbid({
          auctionId,
          previousBidderId: previousHighestBidderId,
          previousBidderName: previousHighestBidderName || '이전 입찰자',
          newHighestBid: requestedAmount,
          newHighestBidderName: actorName,
        });
      }

      if (extended && newEndsAt) {
        this.auctionGateway.broadcastAntiSnipingExtended({
          auctionId,
          extendedMinutes: 2,
          newEndsAt,
          reason: '마감 1분 전 최고가 갱신으로 2분 자동 연장 (Soft Close)',
        });
      }
    }

    // Auto-Counter Proxy Bidding: check if there's an existing higher proxy from another user
    const existingProxy = this.proxyBids.get(auctionId);
    let autoCounterExecuted = false;
    let autoCounterAmount = 0;

    if (existingProxy && existingProxy.userId !== actor && existingProxy.maxBid > requestedAmount) {
      const increment = Math.max(100, Math.ceil(requestedAmount * 0.02)); // +2% or 100 WLD
      autoCounterAmount = Math.min(existingProxy.maxBid, requestedAmount + increment);

      try {
        await queryOne<{ res: unknown }>(
          this.pool,
          `SELECT public.marketplace_bid_auction($1, $2, $3, $4) AS res`,
          [existingProxy.userId, existingProxy.userName, auctionId, String(autoCounterAmount)],
        );

        autoCounterExecuted = true;
        if (this.auctionGateway) {
          this.auctionGateway.broadcastProxyBid({
            id: `proxy-bid-${Date.now()}`,
            auctionId,
            itemTitle: auctionRow?.item_name || '경매 아티팩트',
            autoBidAmount: autoCounterAmount,
            bidderName: existingProxy.userName,
            isProxy: true,
            isPlusUser: existingProxy.isPlusUser,
            timestamp: new Date().toISOString(),
          });

          this.auctionGateway.broadcastOutbid({
            auctionId,
            previousBidderId: actor,
            previousBidderName: actorName,
            newHighestBid: autoCounterAmount,
            newHighestBidderName: `${existingProxy.userName} (자동 프록시)`,
          });
        }
      } catch (err) {
        // Silently handle proxy error without breaking caller's bid
      }
    }

    return {
      res: row?.res ?? null,
      isPlusUser,
      burnFeePercent,
      antiSnipingExtended: extended,
      newEndsAt,
      proxyBiddingActive: !!maxProxyBidWld,
      autoCounterExecuted,
      finalHighestBid: autoCounterExecuted ? autoCounterAmount : requestedAmount,
    };
  }

  // --- Direct P2P Trades ---
  // A trade status is not an escrow, inventory transfer, or double-entry ledger receipt.
  // Hold both reads (the app role cannot SELECT the protected table) and all writes until
  // an owner-scoped PostgreSQL settlement contract is implemented and verified.
  private p2pUnavailable(): ServiceUnavailableException {
    return new ServiceUnavailableException({
      code: 'MARKETPLACE_P2P_SETTLEMENT_UNAVAILABLE',
      message: 'P2P trades are unavailable until verified escrow and atomic settlement exist',
    });
  }

  async listTrades(_actor: string): Promise<unknown[]> {
    throw this.p2pUnavailable();
  }

  async createTrade(
    _actor: string,
    _dto: {
      recipientName: string;
      offeredItems?: Array<{ name: string; quantity: number; rarity?: string }>;
      offeredWld?: string;
      requestedItems?: Array<{ name: string; quantity: number }>;
      requestedWld?: string;
    },
  ): Promise<string | null> {
    throw this.p2pUnavailable();
  }

  async acceptTrade(_actor: string, _tradeId: string): Promise<boolean> {
    throw this.p2pUnavailable();
  }

  async confirmTrade(_actor: string, _tradeId: string): Promise<boolean> {
    throw this.p2pUnavailable();
  }

  async cancelTrade(_actor: string, _tradeId: string): Promise<boolean> {
    throw this.p2pUnavailable();
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
