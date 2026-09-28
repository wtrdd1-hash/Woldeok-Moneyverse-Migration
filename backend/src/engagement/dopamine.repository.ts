import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  /**
   * 황금 오리 광클 피버 보상 원장 기록 및 지갑(USER_CASH) 입금
   */
  async claimGoldenDuck(input: GoldenDuckClaimInput): Promise<GoldenDuckClaimRecord> {
    assertUuid(input.actorUserId, 'actorUserId');
    assertUuid(input.idempotencyKey, 'idempotencyKey');

    const validClicks = Math.min(Math.max(1, Math.floor(input.clickCount || 1)), 200);
    const validMultiplier = Math.min(Math.max(1.0, Number(input.comboMultiplier || 1.0)), 3.0);
    const rewardAmount = Math.min(5000, Math.floor(validClicks * 25 * validMultiplier));

    // 1. 유저 USER_CASH 계좌 조회
    const userCashRow = await queryOne<{ id: string }>(
      this.pool,
      `SELECT account.id::text AS id
       FROM public.accounts AS account
       JOIN public.users AS user_row ON user_row.id = account.owner_user_id
       WHERE account.owner_user_id = $1::uuid
         AND account.account_type = 'USER_CASH'::public.account_type
         AND account.status = 'active'::public.account_status
         AND user_row.status = 'active'::public.user_status`,
      [input.actorUserId],
    );

    if (!userCashRow?.id) {
      throw new DopamineInputError('active cash account not found for user');
    }

    // 2. MINT 시스템 계좌 조회
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

    // 3. economy_post_transaction으로 원장 트랜잭션 기록 및 잔고 원자적 증가
    const txRow = await queryOne<{ transaction_id: string }>(
      this.pool,
      `SELECT public.economy_post_transaction(
         $1::uuid,
         'MINT_TO_USER',
         $2::uuid,
         'dopamine-fever-v1',
         jsonb_build_array(
           jsonb_build_object('accountId', $3::uuid, 'amount', $4::numeric, 'direction', 'credit'),
           jsonb_build_object('accountId', $5::uuid, 'amount', $4::numeric, 'direction', 'debit')
         ),
         'game.dopamine.golden_duck',
         jsonb_build_object(
           'userId', $2::uuid,
           'amount', $4::numeric,
           'clicks', $6::integer,
           'multiplier', $7::numeric
         )
       )::text AS transaction_id`,
      [
        input.idempotencyKey,
        input.actorUserId,
        mintRow.id,
        rewardAmount,
        userCashRow.id,
        validClicks,
        validMultiplier,
      ],
    );

    if (!txRow?.transaction_id) {
      throw new Error('failed to post ledger transaction for golden duck reward');
    }

    // 4. 최신 USER_CASH 잔고 조회
    const balanceRow = await queryOne<{ available_amount: string }>(
      this.pool,
      `SELECT balance.available_amount::text AS available_amount
       FROM public.account_balances AS balance
       WHERE balance.account_id = $1::uuid`,
      [userCashRow.id],
    );

    return {
      success: true,
      userId: input.actorUserId,
      transactionId: txRow.transaction_id,
      rewardAmount,
      newBalance: balanceRow?.available_amount ?? '0',
      clicks: validClicks,
      multiplier: validMultiplier,
      claimedAt: new Date().toISOString(),
    };
  }
}
