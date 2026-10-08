import type { Pool, PoolClient } from 'pg';
import type { Queryable } from '../core/db';

export class StockLeagueInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StockLeagueInputError';
  }
}

export interface StockLeagueSeason {
  readonly id: string;
  readonly seasonNumber: number;
  readonly title: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly entryFee: number;
  readonly prizePool: number;
  readonly treasurySubsidy: number;
  readonly status: 'upcoming' | 'active' | 'settled';
  readonly winnerId: string | null;
  readonly winnerName: string | null;
  readonly totalParticipants: number;
  readonly createdAt: string;
}

export interface StockLeagueParticipant {
  readonly id: string;
  readonly seasonId: string;
  readonly userId: string;
  readonly userName: string;
  readonly initialAsset: number;
  readonly currentAsset: number;
  readonly roiRate: number;
  readonly rankPosition: number;
  readonly tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Challenger';
  readonly isWhale: boolean;
  readonly followerCount: number;
  readonly createdAt: string;
}

export interface CopyTradingSubscription {
  readonly id: string;
  readonly followerId: string;
  readonly followerName: string;
  readonly whaleId: string;
  readonly whaleName: string;
  readonly allocatedBudget: number;
  readonly usedBudget: number;
  readonly copyRatio: number;
  readonly totalProfitShared: number;
  readonly status: 'active' | 'paused' | 'cancelled';
  readonly createdAt: string;
}

export class StockLeagueRepository {
  constructor(private readonly db: Queryable) {}

  private async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const pool = this.db as Pool;
    if (typeof pool.connect !== 'function') {
      return fn(this.db as unknown as PoolClient);
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getCurrentSeason(): Promise<StockLeagueSeason | null> {
    const res = await this.db.query(
      `SELECT id, season_number, title, starts_at, ends_at, entry_fee, prize_pool,
              treasury_subsidy, status, winner_id, winner_name, total_participants, created_at
       FROM public.stock_league_seasons
       WHERE status = 'active'
       ORDER BY starts_at DESC
       LIMIT 1`
    );

    if (res.rows.length === 0) {
      return null;
    }

    const row = res.rows[0];
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      seasonNumber: row.season_number,
      title: row.title,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      entryFee: Number(row.entry_fee),
      prizePool: Number(row.prize_pool),
      treasurySubsidy: Number(row.treasury_subsidy),
      status: row.status,
      winnerId: row.winner_id,
      winnerName: row.winner_name,
      totalParticipants: Number(row.total_participants),
      createdAt: row.created_at,
    };
  }

  async getLeaderboard(seasonId: string, limit = 20): Promise<StockLeagueParticipant[]> {
    const res = await this.db.query(
      `SELECT id, season_id, user_id, user_name, initial_asset, current_asset,
              roi_rate, rank_position, tier, is_whale, follower_count, created_at
       FROM public.stock_league_participants
       WHERE season_id = $1
         AND user_id NOT IN (
           SELECT user_id FROM public.user_roles 
           WHERE role IN ('superadmin', 'operator', 'approver', 'server_operator')
         )
       ORDER BY roi_rate DESC, current_asset DESC
       LIMIT $2`,
      [seasonId, limit]
    );

    return res.rows.map((row, index) => ({
      id: row.id,
      seasonId: row.season_id,
      userId: row.user_id,
      userName: row.user_name,
      initialAsset: Number(row.initial_asset),
      currentAsset: Number(row.current_asset),
      roiRate: Number(row.roi_rate),
      rankPosition: index + 1,
      tier: row.tier,
      isWhale: Boolean(row.is_whale),
      followerCount: Number(row.follower_count),
      createdAt: row.created_at,
    }));
  }

  async getWhales(limit = 10): Promise<StockLeagueParticipant[]> {
    const res = await this.db.query(
      `SELECT p.id, p.season_id, p.user_id, p.user_name, p.initial_asset, p.current_asset,
              p.roi_rate, p.rank_position, p.tier, p.is_whale, p.follower_count, p.created_at
       FROM public.stock_league_participants p
       JOIN public.stock_league_seasons s ON s.id = p.season_id
       WHERE s.status = 'active'
         AND (p.is_whale = TRUE OR p.roi_rate >= 15.0 OR p.current_asset >= 50000000)
         AND p.user_id NOT IN (
           SELECT user_id FROM public.user_roles 
           WHERE role IN ('superadmin', 'operator', 'approver', 'server_operator')
         )
       ORDER BY p.roi_rate DESC, p.follower_count DESC
       LIMIT $1`,
      [limit]
    );

    return res.rows.map((row) => ({
      id: row.id,
      seasonId: row.season_id,
      userId: row.user_id,
      userName: row.user_name,
      initialAsset: Number(row.initial_asset),
      currentAsset: Number(row.current_asset),
      roiRate: Number(row.roi_rate),
      rankPosition: Number(row.rank_position),
      tier: row.tier,
      isWhale: true,
      followerCount: Number(row.follower_count),
      createdAt: row.created_at,
    }));
  }

  async joinSeason(userId: string, userName: string): Promise<StockLeagueParticipant> {
    return this.withTransaction(async (client) => {
      const seasonRes = await client.query(
        `SELECT id, entry_fee, status FROM public.stock_league_seasons
         WHERE status = 'active' ORDER BY starts_at DESC LIMIT 1 FOR UPDATE`
      );
      if (seasonRes.rows.length === 0) {
        throw new StockLeagueInputError('현재 진행 중인 주식 챔피언십 리그가 없습니다.');
      }
      const season = seasonRes.rows[0];
      const entryFee = Number(season.entry_fee);

      // 관리자 계정 참가 차단 가드 (랭킹 공정성 및 관리자 제외 원칙)
      const adminRes = await client.query(
        `SELECT 1 FROM public.user_roles 
         WHERE user_id = $1 AND role IN ('superadmin', 'operator', 'approver', 'server_operator') 
         LIMIT 1`,
        [userId]
      );
      if (adminRes.rows.length > 0) {
        throw new StockLeagueInputError('관리자 계정은 랭킹 공정성을 위해 챔피언십 리그에 참가할 수 없습니다.');
      }

      // 이미 참가 중인지 확인
      const existingRes = await client.query(
        `SELECT id FROM public.stock_league_participants WHERE season_id = $1 AND user_id = $2`,
        [season.id, userId]
      );
      if (existingRes.rows.length > 0) {
        throw new StockLeagueInputError('이미 현재 시즌 리그에 참가 등록되어 있습니다.');
      }

      // 유저 잔액 확인 및 참가비 차감
      const accRes = await client.query(
        `SELECT a.id, ab.available_amount as balance
         FROM public.accounts a
         JOIN public.account_balances ab ON ab.account_id = a.id
         WHERE a.owner_user_id = $1 AND a.account_type = 'USER_CASH' FOR UPDATE`,
        [userId]
      );
      if (accRes.rows.length === 0 || Number(accRes.rows[0]?.balance) < entryFee) {
        throw new StockLeagueInputError(`리그 참가비(${entryFee.toLocaleString()} WLD)가 부족합니다.`);
      }
      const accountId = accRes.rows[0]?.id;
      const currentCash = Number(accRes.rows[0]?.balance);

      await client.query(`UPDATE public.account_balances SET available_amount = available_amount - $1, updated_at = now() WHERE account_id = $2`, [entryFee, accountId]);

      // 참가비 상금 풀 및 국고 귀속 (참가비 전액 리그 상금 풀로 편입)
      await client.query(
        `UPDATE public.stock_league_seasons
         SET prize_pool = prize_pool + $1, total_participants = total_participants + 1
         WHERE id = $2`,
        [entryFee, season.id]
      );

      // 유저 현재 주식 평가액 계산
      const stockRes = await client.query(
        `SELECT COALESCE(SUM(vsp.quantity * vs.current_price), 0) as stock_val
         FROM public.virtual_stock_positions vsp
         JOIN public.virtual_stocks vs ON vs.id = vsp.stock_id
         WHERE vsp.user_id = $1`,
        [userId]
      );
      const totalStockVal = Number(stockRes.rows[0]?.stock_val ?? 0);
      const startingTotalAsset = Math.max(100000, currentCash - entryFee + totalStockVal);

      // 참가자 등록
      const partRes = await client.query(
        `INSERT INTO public.stock_league_participants (
           season_id, user_id, user_name, initial_asset, current_asset, roi_rate, tier
         ) VALUES ($1, $2, $3, $4, $5, 0, 'Bronze')
         RETURNING id, season_id, user_id, user_name, initial_asset, current_asset, roi_rate, rank_position, tier, is_whale, follower_count, created_at`,
        [season.id, userId, userName, startingTotalAsset, startingTotalAsset]
      );

      const row = partRes.rows[0];
      if (!row) {
        throw new StockLeagueInputError('리그 참가 등록 처리에 실패했습니다.');
      }
      return {
        id: row.id,
        seasonId: row.season_id,
        userId: row.user_id,
        userName: row.user_name,
        initialAsset: Number(row.initial_asset),
        currentAsset: Number(row.current_asset),
        roiRate: Number(row.roi_rate),
        rankPosition: Number(row.rank_position),
        tier: row.tier,
        isWhale: Boolean(row.is_whale),
        followerCount: Number(row.follower_count),
        createdAt: row.created_at,
      };
    });
  }

  async subscribeCopyTrading(
    followerId: string,
    followerName: string,
    whaleId: string,
    whaleName: string,
    allocatedBudget: number,
    copyRatio = 1.0
  ): Promise<CopyTradingSubscription> {
    if (followerId === whaleId) {
      throw new StockLeagueInputError('자기 자신을 카피 트레이딩할 수 없습니다.');
    }
    if (allocatedBudget < 10000) {
      throw new StockLeagueInputError('카피 트레이딩 최소 할당 자본금은 10,000 WLD입니다.');
    }

    return this.withTransaction(async (client) => {
      // 구독자 잔고 검증
      const accRes = await client.query(
        `SELECT ab.available_amount as balance
         FROM public.accounts a
         JOIN public.account_balances ab ON ab.account_id = a.id
         WHERE a.owner_user_id = $1 AND a.account_type = 'USER_CASH'`,
        [followerId]
      );
      if (accRes.rows.length === 0 || Number(accRes.rows[0]?.balance) < allocatedBudget) {
        throw new StockLeagueInputError(`카피 트레이딩 할당 잔액(${allocatedBudget.toLocaleString()} WLD)이 부족합니다.`);
      }

      const res = await client.query(
        `INSERT INTO public.copy_trading_subscriptions (
           follower_id, follower_name, whale_id, whale_name, allocated_budget, copy_ratio, status
         ) VALUES ($1, $2, $3, $4, $5, $6, 'active')
         ON CONFLICT (follower_id, whale_id) DO UPDATE
         SET allocated_budget = EXCLUDED.allocated_budget,
             copy_ratio = EXCLUDED.copy_ratio,
             status = 'active',
             updated_at = clock_timestamp()
         RETURNING id, follower_id, follower_name, whale_id, whale_name, allocated_budget, used_budget, copy_ratio, total_profit_shared, status, created_at`,
        [followerId, followerName, whaleId, whaleName, allocatedBudget, copyRatio]
      );

      // 고래 팔로워 수 증가
      await client.query(
        `UPDATE public.stock_league_participants
         SET follower_count = follower_count + 1, is_whale = TRUE
         WHERE user_id = $1`,
        [whaleId]
      );

      const row = res.rows[0];
      return {
        id: row.id,
        followerId: row.follower_id,
        followerName: row.follower_name,
        whaleId: row.whale_id,
        whaleName: row.whale_name,
        allocatedBudget: Number(row.allocated_budget),
        usedBudget: Number(row.used_budget),
        copyRatio: Number(row.copy_ratio),
        totalProfitShared: Number(row.total_profit_shared),
        status: row.status,
        createdAt: row.created_at,
      };
    });
  }

  async cancelCopyTrading(followerId: string, whaleId: string): Promise<boolean> {
    const res = await this.db.query(
      `UPDATE public.copy_trading_subscriptions
       SET status = 'cancelled', updated_at = clock_timestamp()
       WHERE follower_id = $1 AND whale_id = $2
       RETURNING id`,
      [followerId, whaleId]
    );

    if (res.rows.length > 0) {
      await this.db.query(
        `UPDATE public.stock_league_participants
         SET follower_count = GREATEST(0, follower_count - 1)
         WHERE user_id = $1`,
        [whaleId]
      );
      return true;
    }
    return false;
  }

  async getMySubscriptions(followerId: string): Promise<CopyTradingSubscription[]> {
    const res = await this.db.query(
      `SELECT id, follower_id, follower_name, whale_id, whale_name, allocated_budget,
              used_budget, copy_ratio, total_profit_shared, status, created_at
       FROM public.copy_trading_subscriptions
       WHERE follower_id = $1 AND status = 'active'
       ORDER BY created_at DESC`,
      [followerId]
    );

    return res.rows.map((row) => ({
      id: row.id,
      followerId: row.follower_id,
      followerName: row.follower_name,
      whaleId: row.whale_id,
      whaleName: row.whale_name,
      allocatedBudget: Number(row.allocated_budget),
      usedBudget: Number(row.used_budget),
      copyRatio: Number(row.copy_ratio),
      totalProfitShared: Number(row.total_profit_shared),
      status: row.status,
      createdAt: row.created_at,
    }));
  }
}
