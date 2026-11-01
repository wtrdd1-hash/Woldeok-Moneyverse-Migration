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

  /** No owner-scoped, auditable attendance read function is present in the canonical schema. */
  async getAttendanceStatus(_userId: string): Promise<never> {
    throw new DopamineInputError('attendance evidence unavailable');
  }

  /**
   * 7일 연속 출석 스트릭 & 도파민 럭키 룰렛 보상 지급
   */
  /**
   * Never perform the old multi-statement attendance mint. A DB-owned atomic
   * settlement must prove eligibility, replay safety and balanced postings.
   */
  async claimAttendanceSpin(_userId: string, _idempotencyKey: string): Promise<never> {
    throw new DopamineInputError('attendance settlement unavailable');
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


