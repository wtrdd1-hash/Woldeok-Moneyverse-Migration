import type { Queryable } from '../core/db';
import { withPgTransaction } from '../core/with-transaction';
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
  private async getUserCashAccount(userId: string, db: Queryable = this.pool): Promise<{ accountId: string; availableAmount: number; displayName: string }> {
    const row = await queryOne<{ account_id: string; available_amount: string; display_name: string }>(
      db,
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
    const expiredRows = await queryRows<{ id: string }>(
      this.pool,
      `SELECT id FROM public.black_market_auctions
       WHERE status = 'active' AND ends_at <= clock_timestamp()`,
    );

    for (const auction of expiredRows) {
      try {
        await withPgTransaction(this.pool, async (db) => {
          // Locks remain held until COMMIT. Competing workers cannot settle twice.
          const locked = await queryOne<any>(
            db,
            `SELECT * FROM public.black_market_auctions
             WHERE id = $1::uuid AND status = 'active'
               AND ends_at <= clock_timestamp() FOR UPDATE`,
            [auction.id],
          );
          if (!locked) return;
          if (!locked.highest_bidder_id) {
            await db.query(
              `UPDATE public.black_market_auctions SET status = 'ended'
               WHERE id = $1::uuid`,
              [locked.id],
            );
            return;
          }

          const winningBid = Number(locked.current_bid);
          if (!Number.isSafeInteger(winningBid) || winningBid <= 0) {
            throw new BlackMarketInputError('invalid auction settlement amount');
          }
          const winnerCash = await this.getUserCashAccount(locked.highest_bidder_id, db);

          // Conditional debit: insufficient funds never cause negative balances.
          const debit = await queryOne<{ account_id: string }>(
            db,
            `UPDATE public.account_balances
             SET available_amount = available_amount - $1, updated_at = clock_timestamp()
             WHERE account_id = $2::uuid AND available_amount >= $1 RETURNING account_id`,
            [winningBid, winnerCash.accountId],
          );
          if (!debit) throw new BlackMarketInputError('auction bidder balance insufficient');

          const credited = await queryOne<{ account_id: string }>(
            db,
            `UPDATE public.account_balances
             SET available_amount = available_amount + $1, updated_at = clock_timestamp()
             WHERE account_id = (SELECT id FROM public.accounts WHERE system_key = 'sink' LIMIT 1)
             RETURNING account_id`,
            [winningBid],
          );
          if (!credited) throw new Error('auction sink account unavailable');

          await db.query(
            `INSERT INTO public.user_inventory_items
             (user_id, item_code, category, name, description, rarity, quantity)
             VALUES ($1::uuid, $2, 'BLACK_MARKET', $3, $4, 'MYTHIC', 1)`,
            [locked.highest_bidder_id, locked.item_code, locked.item_title, locked.item_description],
          );
          await db.query(
            `INSERT INTO public.in_app_notifications (user_id, category, title, body, link)
             VALUES ($1::uuid, 'PRODUCT_ACTIVITY', $2, $3, '/inventory')`,
            [
              locked.highest_bidder_id,
              '🏆 [비밀 암시장 낙찰 성공!] 초희귀 아이템 획득',
              '경매 낙찰이 확정됐습니다. 인벤토리에서 아이템과 거래 내역을 확인하세요.',
            ],
          );
          await db.query(
            `UPDATE public.black_market_auctions SET status = 'settled' WHERE id = $1::uuid`,
            [locked.id],
          );
        });
      } catch (error) {
        // A failed transaction leaves the auction active and transfers undone.
        // Do not mark it settled/ended outside the same transaction.
        console.warn('Black market auction settlement deferred', error instanceof Error ? error.name : 'error');
      }
    }
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

  /**
   * 호가 입찰 실행 (안티 스나이핑 30초 자동 연장 포함)
   */
  async placeBid(auctionId: string, bidderUserId: string, bidAmount: number): Promise<{
    auction: BlackMarketAuction;
    extended: boolean;
  }> {
    if (!Number.isSafeInteger(bidAmount) || bidAmount <= 0) throw new BlackMarketInputError('invalid bid amount');
    return withPgTransaction(this.pool, async (db) => {
      // 1. 경매 조회 및 행 잠금
      const auction = await queryOne<any>(
        db,
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

      const bidderCash = await this.getUserCashAccount(bidderUserId, db);
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
        db,
        `INSERT INTO public.black_market_bid_logs (auction_id, bidder_user_id, bidder_name, bid_amount)
         VALUES ($1::uuid, $2::uuid, $3, $4)`,
        [auctionId, bidderUserId, bidderCash.displayName, bidAmount],
      );

      // 4. 경매 최고 입찰가 갱신
      const updated = await queryOne<any>(
        db,
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
          db,
          `INSERT INTO public.in_app_notifications (user_id, category, title, body, link)
           VALUES ($1::uuid, 'PRODUCT_ACTIVITY', $2, $3, '/marketplace/auction')`,
          [
            auction.highest_bidder_id,
            '⚠️ [암시장 상위 입찰 발생] 최고 입찰가를 갱신당했습니다!',
            `${auction.item_title}에 대해 다른 경쟁자가 ${bidAmount.toLocaleString()} WLD로 상위 입찰했습니다. 서둘러 재입찰하세요!`,
          ],
        );
      }

      if (!updated) throw new BlackMarketInputError('auction update failed');
      return {
        auction: {
          ...updated,
          isMine: true,
        },
        extended,
      };
    });
  }
}
