import { ServiceUnavailableException } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryRows } from '../core/db';

export class BlackMarketInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlackMarketInputError';
  }
}

/** An unconditional hold until a scoped, idempotent Economy Core command settles the auction. */
export class BlackMarketSettlementHoldError extends ServiceUnavailableException {
  constructor() {
    super({
      code: 'BLACK_MARKET_LEDGER_SETTLEMENT_UNCERTIFIED',
      message: 'Secret-auction bids and financial settlement are paused pending canonical ledger verification.',
    });
  }
}

export interface BlackMarketAuction {
  readonly id: string;
  readonly itemCode: string;
  readonly itemTitle: string;
  readonly itemDescription: string;
  readonly itemIcon: string;
  readonly itemBuffType: string;
  readonly itemBuffValue: number;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly startingBid: number;
  readonly currentBid: number;
  readonly highestBidderId: string | null;
  readonly highestBidderName: string | null;
  readonly bidCount: number;
  readonly status: 'scheduled' | 'active' | 'ended' | 'settled';
  readonly isMine?: boolean;
  readonly remainingSeconds?: number;
}

export interface BlackMarketBidLog {
  readonly id: string;
  readonly auctionId: string;
  readonly bidderUserId: string;
  readonly bidderName: string;
  readonly bidAmount: number;
  readonly createdAt: string;
}

export class BlackMarketRepository {
  constructor(private readonly pool: Queryable) {}

  /**
   * Historical auctions remain visible; no financial mutation may resume from
   * this worker until a reviewed, ledger-first settlement command replaces it.
   */
  async settleExpiredAuctions(): Promise<void> {
    // Do not mutate auction status or member money: even a "settled" flag
    // without an immutable debit/credit receipt would misrepresent ownership.
    return;
  }

  /**
   * 활성 및 최근 암시장 경매 목록 조회
   */
  async listAuctions(currentUserId?: string | null): Promise<readonly BlackMarketAuction[]> {
    // Viewing auctions must never debit funds or trigger final settlement.
    // Payouts remain blocked until a separate canonical-ledger worker exists.
    const rows = await queryRows<any>(
      this.pool,
      `SELECT 
         id,
         item_code AS "itemCode",
         item_title AS "itemTitle",
         item_description AS "itemDescription",
         item_icon AS "itemIcon",
         item_buff_type AS "itemBuffType",
         item_buff_value::float AS "itemBuffValue",
         starts_at AS "startsAt",
         ends_at AS "endsAt",
         starting_bid::float AS "startingBid",
         current_bid::float AS "currentBid",
         highest_bidder_id AS "highestBidderId",
         highest_bidder_name AS "highestBidderName",
         bid_count AS "bidCount",
         status,
         greatest(0, extract(epoch from (ends_at - clock_timestamp())))::int AS "remainingSeconds"
       FROM public.black_market_auctions
       WHERE status = 'active' AND ends_at > clock_timestamp()
       ORDER BY ends_at ASC`,
    );

    return rows.map((r) => ({
      ...r,
      isMine: currentUserId ? r.highestBidderId === currentUserId : false,
    }));
  }

  /**
   * 특정 경매의 최근 입찰 로그 목록 조회
   */
  async getBidLogs(auctionId: string, limit = 20): Promise<readonly BlackMarketBidLog[]> {
    const rows = await queryRows<any>(
      this.pool,
      `SELECT 
         id,
         auction_id AS "auctionId",
         bidder_user_id AS "bidderUserId",
         bidder_name AS "bidderName",
         bid_amount::float AS "bidAmount",
         created_at AS "createdAt"
       FROM public.black_market_bid_logs
       WHERE auction_id = $1::uuid
       ORDER BY created_at DESC
       LIMIT $2`,
      [auctionId, limit],
    );
    return rows;
  }

  /** Prevent new promises of an item when the settlement engine is uncertified. */
  async placeBid(_auctionId: string, _bidderUserId: string, _bidAmount: number): Promise<{
    auction: BlackMarketAuction;
    extended: boolean;
  }> {
    throw new BlackMarketSettlementHoldError();
  }
}
