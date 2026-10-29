import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const DAILY_QUEST_REWARDS: Record<string, number> = {
  quest_stock_analysis: 500,
  quest_savings_deposit: 1000,
  quest_daily_roulette: 500,
  quest_financial_quiz: 1000,
  all_clear: 2000,
};

export interface DailyQuestClaimInput {
  readonly actorUserId: string;
  readonly idempotencyKey: string;
  readonly questId: string;
}

export interface DailyQuestClaimRecord {
  readonly success: boolean;
  readonly userId: string;
  readonly questId: string;
  readonly transactionId: string;
  readonly rewardAmount: number;
  readonly newBalance: string;
  readonly claimedAt: string;
}

export interface DailyQuestStatusRecord {
  readonly claimedQuests: Record<string, boolean>;
  readonly allClearClaimed: boolean;
  readonly totalEarnedToday: number;
}

export class DopamineInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DopamineInputError';
  }
}

function assertUuid(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== 'string' || !UUID_REGEX.test(value)) {
    throw new DopamineInputError(`${fieldName} must be a valid UUID`);
  }
}

export interface GoldenDuckClaimInput {
  readonly actorUserId: string;
  readonly idempotencyKey: string;
  readonly clickCount: number;
  readonly comboMultiplier: number;
}

export interface GoldenDuckClaimRecord {
  readonly success: boolean;
  readonly userId: string;
  readonly transactionId: string;
  readonly rewardAmount: number;
  readonly newBalance: string;
  readonly clicks: number;
  readonly multiplier: number;
  readonly claimedAt: string;
}

@Injectable()
export class DopamineRepository {
  constructor(private readonly pool: Queryable) {}

  /** Read-only, owner-filtered evidence of an actual posted cash credit in Seoul today. */
  async goldenDuckLedgerStatus(actorUserId: string): Promise<{ claimedToday: boolean; transactionId: string | null }> {
    assertUuid(actorUserId, 'actorUserId');
    const row = await queryOne<{ transaction_id: string }>(
      this.pool,
      `SELECT tx.id::text AS transaction_id
       FROM public.ledger_transactions AS tx
       JOIN public.ledger_postings AS posting ON posting.transaction_id = tx.id
       JOIN public.accounts AS account ON account.id = posting.account_id
       WHERE tx.actor_user_id = $1::uuid
         AND account.owner_user_id = $1::uuid
         AND account.account_type = 'USER_CASH'::public.account_type
         AND posting.direction = 'credit'::public.posting_direction
         AND posting.amount > 0
         AND tx.policy_version = 'game.dopamine.golden_duck'
         AND tx.created_at >= ((now() AT TIME ZONE 'Asia/Seoul')::date::timestamp AT TIME ZONE 'Asia/Seoul')
         AND tx.created_at < (((now() AT TIME ZONE 'Asia/Seoul')::date + 1)::timestamp AT TIME ZONE 'Asia/Seoul')
       ORDER BY tx.created_at DESC, tx.id DESC
       LIMIT 1`,
      [actorUserId],
    );
    return { claimedToday: Boolean(row), transactionId: row?.transaction_id ?? null };
  }

  /** Legacy entrypoint retained only to refuse accidental internal calls.
   * No code may mint from a client-reported tap count without a new atomic
   * SECURITY DEFINER settlement and verified idempotent receipt.
   */
  async claimGoldenDuck(_input: GoldenDuckClaimInput): Promise<GoldenDuckClaimRecord> {
    throw new DopamineInputError('Golden Duck settlement unavailable');
  }

  async getAttendanceStatus(userId: string) {
    assertUuid(userId, 'userId');

    // 1. 최근 출석 기록 조회
    const historyRows = await queryOne<{
      checked_in_today: boolean;
      streak_days: number;
      last_date: string | null;
    }>(
      this.pool,
      `WITH latest AS (
         SELECT attended_date, streak_count
         FROM public.daily_attendance_logs
         WHERE user_id = $1::uuid
         ORDER BY attended_date DESC
         LIMIT 1
       )
       SELECT
         EXISTS(SELECT 1 FROM latest WHERE attended_date = CURRENT_DATE) AS checked_in_today,
         COALESCE(
           (SELECT CASE 
             WHEN attended_date = CURRENT_DATE THEN streak_count
             WHEN attended_date = CURRENT_DATE - INTERVAL '1 day' THEN streak_count
             ELSE 0
           END FROM latest),
           0
         )::integer AS streak_days,
         (SELECT attended_date::text FROM latest) AS last_date`,
      [userId],
    );

    const checkedInToday = historyRows?.checked_in_today ?? false;
    const currentStreak = historyRows?.streak_days ?? 0;
    const nextStreak = checkedInToday ? currentStreak : currentStreak + 1;
    const isJackpotEligible = nextStreak >= 7;
    const nextRewardPreview = isJackpotEligible ? 500 : Math.min(100, 10 * Math.max(1, nextStreak));

    return {
      checkedInToday,
      streakDays: currentStreak,
      lastAttendedDate: historyRows?.last_date ?? null,
      nextRewardPreview,
      isJackpotEligible,
    };
  }

  /**
   * 7일 연속 출석 스트릭 & 도파민 럭키 룰렛 보상 지급
   */
  async claimAttendanceSpin(userId: string, idempotencyKey: string) {
    assertUuid(userId, 'userId');
    assertUuid(idempotencyKey, 'idempotencyKey');

    // 1. 오늘 이미 출석했는지 검사
    const todayCheck = await queryOne<{ id: string }>(
      this.pool,
      `SELECT id::text FROM public.daily_attendance_logs
       WHERE user_id = $1::uuid AND attended_date = CURRENT_DATE LIMIT 1`,
      [userId],
    );

    if (todayCheck?.id) {
      throw new DopamineInputError('오늘의 출석 체크 및 행운의 룰렛을 이미 완료하셨습니다. (내일 00:00 재참여 가능)');
    }

    // 2. 어제 출석 여부 확인하여 스트릭 계산
    const yesterdayCheck = await queryOne<{ streak_count: number }>(
      this.pool,
      `SELECT streak_count FROM public.daily_attendance_logs
       WHERE user_id = $1::uuid AND attended_date = CURRENT_DATE - INTERVAL '1 day' LIMIT 1`,
      [userId],
    );

    const prevStreak = yesterdayCheck?.streak_count ?? 0;
    const newStreak = prevStreak >= 7 ? 1 : prevStreak + 1;
    const isJackpot = newStreak === 7;

    // 룰렛 보상 풀: 기본(10~100 WLD), 7일차 잭팟(500~1,000 WLD)
    const rewards = isJackpot ? [500, 777, 1000] : [10, 20, 30, 50, 70, 100];
    const rewardAmount = rewards[Math.floor(Math.random() * rewards.length)];

    // 3. 계좌 조회
    const userCashRow = await queryOne<{ id: string }>(
      this.pool,
      `SELECT account.id::text AS id
       FROM public.accounts AS account
       JOIN public.users AS user_row ON user_row.id = account.owner_user_id
       WHERE account.owner_user_id = $1::uuid
         AND account.account_type = 'USER_CASH'::public.account_type
         AND account.status = 'active'::public.account_status
         AND user_row.status = 'active'::public.user_status`,
      [userId],
    );

    if (!userCashRow?.id) {
      throw new DopamineInputError('활성화된 현금 지갑을 찾을 수 없습니다.');
    }

    const mintRow = await queryOne<{ id: string }>(
      this.pool,
      `SELECT account.id::text AS id
       FROM public.accounts AS account
       WHERE account.system_key = 'mint'
         AND account.account_type = 'MINT'::public.account_type
         AND account.status = 'active'::public.account_status`,
    );

    if (!mintRow?.id) {
      throw new Error('mint account unavailable');
    }

    // 4. 출석 원장 기록 (daily_attendance_logs)
    await queryOne(
      this.pool,
      `INSERT INTO public.daily_attendance_logs (user_id, attended_date, streak_count, reward_wld, is_jackpot)
       VALUES ($1::uuid, CURRENT_DATE, $2, $3, $4)
       ON CONFLICT (user_id, attended_date) DO NOTHING`,
      [userId, newStreak, rewardAmount, isJackpot],
    );

    // 5. 경제 트랜잭션 기록
    await queryOne(
      this.pool,
      `SELECT public.economy_post_transaction(
         $1::uuid,
         'MINT_TO_USER',
         $2::uuid,
         NULL,
         jsonb_build_array(
           jsonb_build_object('accountId', $3::uuid, 'amount', $4::numeric, 'direction', 'credit'),
           jsonb_build_object('accountId', $5::uuid, 'amount', $4::numeric, 'direction', 'debit')
         ),
         'game.dopamine.attendance_spin',
         jsonb_build_object(
           'userId', $2::uuid,
           'amount', $4::numeric,
           'streakDays', $6::integer,
           'isJackpot', $7::boolean
         )
       )`,
      [idempotencyKey, userId, mintRow.id, rewardAmount, userCashRow.id, newStreak, isJackpot],
    );

    // 6. 알림함(in_app_notifications) 등록
    await queryOne(
      this.pool,
      `INSERT INTO public.in_app_notifications (user_id, category, title, body, link)
       VALUES (
         $1::uuid,
         'PRODUCT_ACTIVITY',
         $2,
         $3,
         '/quests'
       )`,
      [
        userId,
        isJackpot ? '🎰 [7일 잭팟] 연속 출석 잭팟 보상 당첨!' : `🎰 [출석 체크] ${newStreak}일차 출석 완료!`,
        isJackpot
          ? `축하합니다! 7일 연속 출석을 달성하여 잭팟 보상 ${rewardAmount} WLD가 지갑에 즉시 지급되었습니다.`
          : `행운의 룰렛 당첨금 ${rewardAmount} WLD가 지급되었습니다. (현재 ${newStreak}일 연속 출석 중)`,
      ],
    );

    // 7. 최신 잔액 조회
    const balanceRow = await queryOne<{ available_amount: string }>(
      this.pool,
      `SELECT balance.available_amount::text AS available_amount
       FROM public.account_balances AS balance
       WHERE balance.account_id = $1::uuid`,
      [userCashRow.id],
    );

    return {
      success: true,
      rewardAmount,
      streakDays: newStreak,
      isJackpot,
      newBalance: balanceRow?.available_amount ?? '0',
      claimedAt: new Date().toISOString(),
    };
  }

  /**
   * Direct repository invocation must not bypass the HTTP settlement hold.
   * Eligibility is not server-attested and the legacy mint was non-atomic.
   */
  async claimDailyQuest(_input: DailyQuestClaimInput): Promise<DailyQuestClaimRecord> {
    throw new Error('DAILY_QUEST_SETTLEMENT_UNAVAILABLE');
  }

  /**
   * 당일 일일 퀘스트 수령 현황 및 총 획득액 서버 권위 조회
   */
  async getDailyQuestStatus(actorUserId: string): Promise<DailyQuestStatusRecord> {
    assertUuid(actorUserId, 'actorUserId');

    const rows = await queryRows<{ policy_version: string }>(
      this.pool,
      `SELECT policy_version
       FROM public.ledger_transactions
       WHERE actor_user_id = $1::uuid
         AND policy_version LIKE 'quest.daily.%'
         AND created_at >= CURRENT_DATE`,
      [actorUserId],
    );

    const claimedQuests: Record<string, boolean> = {};
    let allClearClaimed = false;
    let totalEarnedToday = 0;

    for (const row of rows) {
      const qId = row.policy_version.replace('quest.daily.', '');
      if (qId === 'all_clear') {
        allClearClaimed = true;
      } else {
        claimedQuests[qId] = true;
      }
      totalEarnedToday += DAILY_QUEST_REWARDS[qId] ?? 0;
    }

    return {
      claimedQuests,
      allClearClaimed,
      totalEarnedToday,
    };
  }
}


