import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

export class BlackMarketInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlackMarketInputError';
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
   * 유저 현금 지갑 계좌 및 잔액 조회
   */
  private async getUserCashAccount(userId: string): Promise<{ accountId: string; availableAmount: number; displayName: string }> {
    const row = await queryOne<{ account_id: string; available_amount: string; display_name: string }>(
      this.pool,
      `SELECT 
         a.id AS account_id,
         b.available_amount::text AS available_amount,
         coalesce(i.display_name, '시민') AS display_name
       FROM public.accounts a
       JOIN public.account_balances b ON b.account_id = a.id
       LEFT JOIN public.identities i ON i.user_id = a.owner_user_id
       WHERE a.owner_user_id = $1::uuid
         AND a.account_type = 'USER_CASH'::public.account_type
         AND a.status = 'active'::public.account_status
       LIMIT 1`,
      [userId],
    );

    if (!row) {
      throw new BlackMarketInputError('활성화된 현금 지갑을 찾을 수 없습니다.');
    }

    return {
      accountId: row.account_id,
      availableAmount: parseFloat(row.available_amount || '0'),
      displayName: row.display_name,
    };
  }

  /**
   * 만료된 경매 자동 정산 (낙찰금 100% 영구 SINK 소각 & 인벤토리 지급)
   */
  async settleExpiredAuctions(): Promise<void> {
    const expiredRows = await queryRows<any>(
      this.pool,
      `SELECT * FROM public.black_market_auctions
       WHERE status = 'active' AND ends_at <= clock_timestamp()`,
    );

    for (const auction of expiredRows) {
      if (!auction.highest_bidder_id) {
        await queryOne(
          this.pool,
          `UPDATE public.black_market_auctions SET status = 'ended' WHERE id = $1::uuid`,
          [auction.id],
        );
        continue;
      }

      const winningBid = parseFloat(auction.current_bid);
      const winnerId = auction.highest_bidder_id;

      try {
        const winnerCash = await this.getUserCashAccount(winnerId);

        // 1. 낙찰자 계좌에서 대금 차감
        await queryOne(
          this.pool,
          `UPDATE public.account_balances
           SET available_amount = available_amount - $1, updated_at = clock_timestamp()
           WHERE account_id = $2::uuid`,
          [winningBid, winnerCash.accountId],
        );

        // 2. 대금 100% 영구 SINK 소각 (system_key = 'sink')
        await queryOne(
          this.pool,
          `UPDATE public.account_balances
           SET available_amount = available_amount + $1, updated_at = clock_timestamp()
           WHERE account_id = (SELECT id FROM public.accounts WHERE system_key = 'sink' LIMIT 1)`,
          [winningBid],
        );

        // 3. 인벤토리(user_inventory_items)에 낙찰 아이템 지급
        await queryOne(
          this.pool,
          `INSERT INTO public.user_inventory_items (
             user_id, item_code, category, name, description, rarity, quantity
           )
           VALUES ($1::uuid, $2, 'BLACK_MARKET', $3, $4, 'MYTHIC', 1)`,
          [winnerId, auction.item_code, auction.item_title, auction.item_description],
        );

        // 4. 낙찰 성공 알림 발송
        await queryOne(
          this.pool,
          `INSERT INTO public.in_app_notifications (user_id, category, title, body, link)
           VALUES ($1::uuid, 'PRODUCT_ACTIVITY', $2, $3, '/inventory')`,
          [
            winnerId,
            '🏆 [비밀 암시장 낙찰 성공!] 초희귀 아이템 획득',
            `축하합니다! ${auction.item_title}을(를) ${winningBid.toLocaleString()} WLD에 최종 낙찰받았습니다. 인벤토리에서 확인하세요. (대금 100% 영구 소각 완료)`,
          ],
        );

        // 5. 경매 상태 정산 완료 처리
        await queryOne(
          this.pool,
          `UPDATE public.black_market_auctions SET status = 'settled' WHERE id = $1::uuid`,
          [auction.id],
        );
      } catch (err) {
        // 정산 실패 시 ended로 마킹 후 재시도 가능하게 유지
        await queryOne(
          this.pool,
          `UPDATE public.black_market_auctions SET status = 'ended' WHERE id = $1::uuid`,
          [auction.id],
        );
      }
    }
  }

  /**
   * 활성 및 최근 암시장 경매 목록 조회
   */
  async listAuctions(currentUserId?: string | null): Promise<readonly BlackMarketAuction[]> {
    await this.settleExpiredAuctions();

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
       WHERE status = 'active'
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

  /**
   * 호가 입찰 실행 (안티 스나이핑 30초 자동 연장 포함)
   */
  async placeBid(auctionId: string, bidderUserId: string, bidAmount: number): Promise<{
    auction: BlackMarketAuction;
    extended: boolean;
  }> {
    // 1. 경매 조회 및 행 잠금
    const auction = await queryOne<any>(
      this.pool,
      `SELECT * FROM public.black_market_auctions WHERE id = $1::uuid FOR UPDATE`,
      [auctionId],
    );

    if (!auction) {
      throw new BlackMarketInputError('존재하지 않는 암시장 경매입니다.');
    }

    if (auction.status !== 'active') {
      throw new BlackMarketInputError('현재 진행 중인 경매가 아닙니다.');
    }

    const now = new Date();
    const endsAt = new Date(auction.ends_at);
    if (now >= endsAt) {
      throw new BlackMarketInputError('이미 종료된 경매입니다.');
    }

    if (auction.highest_bidder_id === bidderUserId) {
      throw new BlackMarketInputError('이미 최고가 입찰자입니다.');
    }

    const currentBid = parseFloat(auction.current_bid);
    const minIncrement = Math.max(10000, Math.round(currentBid * 0.05));
    const minRequiredBid = currentBid + minIncrement;

    if (bidAmount < minRequiredBid) {
      throw new BlackMarketInputError(
        `최소 입찰 가능 금액은 ${minRequiredBid.toLocaleString()} WLD 입니다. (최소 호가 단위: +${minIncrement.toLocaleString()} WLD)`,
      );
    }

    const bidderCash = await this.getUserCashAccount(bidderUserId);
    if (bidderCash.availableAmount < bidAmount) {
      throw new BlackMarketInputError(
        `잔액이 부족합니다. (필요 금액: ${bidAmount.toLocaleString()} WLD, 보유 잔액: ${bidderCash.availableAmount.toLocaleString()} WLD)`,
      );
    }

    // 2. 안티 스나이핑 (Anti-Sniping Invariant): 마감 30초 미만 시 30초 자동 연장
    const remainingMs = endsAt.getTime() - now.getTime();
    let extended = false;
    let newEndsAt = endsAt;

    if (remainingMs < 30000) {
      newEndsAt = new Date(now.getTime() + 30000);
      extended = true;
    }

    // 3. 입찰 로그 기록
    await queryOne(
      this.pool,
      `INSERT INTO public.black_market_bid_logs (auction_id, bidder_user_id, bidder_name, bid_amount)
       VALUES ($1::uuid, $2::uuid, $3, $4)`,
      [auctionId, bidderUserId, bidderCash.displayName, bidAmount],
    );

    // 4. 경매 최고 입찰가 갱신
    const updated = await queryOne<any>(
      this.pool,
      `UPDATE public.black_market_auctions
       SET current_bid = $1,
           highest_bidder_id = $2::uuid,
           highest_bidder_name = $3,
           bid_count = bid_count + 1,
           ends_at = $4
       WHERE id = $5::uuid
       RETURNING 
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
         greatest(0, extract(epoch from (ends_at - clock_timestamp())))::int AS "remainingSeconds"`,
      [bidAmount, bidderUserId, bidderCash.displayName, newEndsAt, auctionId],
    );

    // 5. 직전 최고 입찰자에게 상위 입찰 알림 발송
    if (auction.highest_bidder_id && auction.highest_bidder_id !== bidderUserId) {
      await queryOne(
        this.pool,
        `INSERT INTO public.in_app_notifications (user_id, category, title, body, link)
         VALUES ($1::uuid, 'PRODUCT_ACTIVITY', $2, $3, '/marketplace/auction')`,
        [
          auction.highest_bidder_id,
          '⚠️ [암시장 상위 입찰 발생] 최고 입찰가를 갱신당했습니다!',
          `${auction.item_title}에 대해 다른 경쟁자가 ${bidAmount.toLocaleString()} WLD로 상위 입찰했습니다. 서둘러 재입찰하세요!`,
        ],
      );
    }

    return {
      auction: {
        ...updated,
        isMine: true,
      },
      extended,
    };
  }
}
