import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BankInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BankInputError';
  }
}

function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new BankInputError(`${field} must be a UUID`);
  }
}

function assertAmount(value: unknown, field: string): bigint {
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value)) {
    throw new BankInputError(`${field} must be a positive integer string`);
  }
  return BigInt(value);
}

export class BankRepository {
  constructor(private readonly pool: Queryable) {}

  async getStanding(actor: unknown): Promise<unknown> {
    assertUuid(actor, 'actor');
    const row = await queryOne<{ standing: unknown }>(
      this.pool,
      `SELECT public.bank_get_my_standing($1) AS standing`,
      [actor],
    );
    return row?.standing ?? null;
  }

  /** Read-only, actor-scoped game credit signals; no synthetic activity or repayments. */
  async getCreditFacts(actor: unknown): Promise<{
    accountAgeDays: number;
    jobLevel: number;
    historicalRepaymentsCount: number;
    overdueRepaymentsCount: number;
  }> {
    assertUuid(actor, 'actor');
    const row = await queryOne<{
      account_age_days: number;
      job_level: number;
      repayment_count: number;
      overdue_count: number;
    }>(
      this.pool,
      `SELECT
         GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (now() - u.created_at)) / 86400))::integer AS account_age_days,
         COALESCE((SELECT MAX(j.level) FROM public.user_job_progress j
                   WHERE j.user_id = u.id AND j.is_active), 0)::integer AS job_level,
         (SELECT COUNT(*)::integer FROM public.virtual_bank_loan_repayments r
          JOIN public.virtual_bank_loans l ON l.id = r.loan_id
          WHERE l.user_id = u.id) AS repayment_count,
         (SELECT COUNT(*)::integer FROM public.virtual_bank_loans l
          WHERE l.user_id = u.id AND (l.overdue_at IS NOT NULL OR l.status = 'overdue')) AS overdue_count
       FROM public.users u
       WHERE u.id = $1::uuid AND u.status = 'active'::public.user_status`,
      [actor],
    );
    if (!row) throw new Error('credit profile unavailable');
    return {
      accountAgeDays: row.account_age_days,
      jobLevel: row.job_level,
      historicalRepaymentsCount: row.repayment_count,
      overdueRepaymentsCount: row.overdue_count,
    };
  }

  /** Read-only owner projection; redeemed bonds are deliberately absent. */
  async listBondHoldings(actor: unknown): Promise<{
    bonds: Array<{
      id: string; bond_code: string; bond_name: string; principal_amount: string;
      maturity_amount: string; yield_bps: number; purchased_at: string;
      maturity_at: string; is_matured: boolean; status: 'holding';
    }>;
    scope: 'current_holdings_only';
  }> {
    const standing = await this.getStanding(actor);
    if (!standing || typeof standing !== 'object' || Array.isArray(standing)) {
      throw new Error('verified bank standing unavailable');
    }
    const bonds: unknown = (standing as Record<string, unknown>)['bonds'];
    if (!Array.isArray(bonds) || bonds.length > 100) {
      throw new Error('bounded bond holdings unavailable');
    }
    const amount = (value: unknown): value is string =>
      typeof value === 'string' && /^(0|[1-9][0-9]{0,37})$/.test(value);
    const timestamp = (value: unknown): value is string =>
      typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) &&
      Number.isFinite(Date.parse(value));
    const verified = bonds.map((value: unknown) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('invalid bond holding');
      }
      const b = value as Record<string, unknown>;
      if (typeof b['id'] !== 'string' || !UUID.test(b['id']) ||
          typeof b['bond_code'] !== 'string' || b['bond_code'].length < 1 || b['bond_code'].length > 40 ||
          typeof b['bond_name'] !== 'string' || b['bond_name'].length < 1 || b['bond_name'].length > 200 ||
          !amount(b['principal_amount']) || !amount(b['maturity_amount']) ||
          !Number.isSafeInteger(b['yield_bps']) || (b['yield_bps'] as number) < 0 ||
          !timestamp(b['purchased_at']) || !timestamp(b['maturity_at']) ||
          typeof b['is_matured'] !== 'boolean' || b['status'] !== 'holding') {
        throw new Error('invalid verified bond holding');
      }
      return {
        id: b['id'], bond_code: b['bond_code'], bond_name: b['bond_name'],
        principal_amount: b['principal_amount'], maturity_amount: b['maturity_amount'],
        yield_bps: b['yield_bps'] as number, purchased_at: b['purchased_at'],
        maturity_at: b['maturity_at'], is_matured: b['is_matured'], status: 'holding' as const,
      };
    });
    return { bonds: verified, scope: 'current_holdings_only' };
  }

  async moveBalance(
    key: unknown,
    actor: unknown,
    direction: 'deposit' | 'withdraw',
    amountStr: unknown,
  ): Promise<string> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    const amount = assertAmount(amountStr, 'amount');

    const row = await queryOne<{ tx_id: string }>(
      this.pool,
      `SELECT public.bank_move_balance($1, $2, $3, $4) AS tx_id`,
      [key, actor, direction, amount.toString()],
    );
    if (!row?.tx_id) throw new Error('database did not return a transaction id for bank transfer');
    return row.tx_id;
  }

  async claimCompoundInterest(key: unknown, actor: unknown): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');

    return queryOne(
      this.pool,
      `SELECT claimed_amount::text, new_bank_balance::text, transaction_id::text
       FROM public.bank_claim_compound_interest($1, $2)`,
      [actor, key],
    );
  }

  async borrowSmart(key: unknown, actor: unknown, amountStr: unknown): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    const amount = assertAmount(amountStr, 'amount');

    return queryOne(
      this.pool,
      `SELECT loan_id::text, principal_amount::text, interest_amount::text,
              outstanding_amount::text, transaction_id::text
       FROM public.bank_borrow($1, $2, $3)`,
      [key, actor, amount.toString()],
    );
  }

  async repayLoan(
    key: unknown,
    actor: unknown,
    loanId: unknown,
    amountStr: unknown,
  ): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(loanId, 'loan id');
    const amount = assertAmount(amountStr, 'amount');

    return queryOne(
      this.pool,
      `SELECT loan_id::text, paid_amount::text, outstanding_amount::text,
              transaction_id::text, replayed
       FROM public.bank_repay($1, $2, $3, $4)`,
      [key, actor, loanId, amount.toString()],
    );
  }

  async purchaseBond(
    key: unknown,
    actor: unknown,
    bondCode: string,
    amountStr: unknown,
  ): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    const amount = assertAmount(amountStr, 'amount');

    return queryOne(
      this.pool,
      `SELECT bond_id::text, bond_name, principal_amount::text,
              maturity_amount::text, maturity_at, transaction_id::text
       FROM public.bank_purchase_bond($1, $2, $3, $4)`,
      [actor, bondCode, amount.toString(), key],
    );
  }

  async redeemBond(key: unknown, actor: unknown, bondId: unknown): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(bondId, 'bond id');

    return queryOne(
      this.pool,
      `SELECT bond_id::text, maturity_amount::text, transaction_id::text
       FROM public.bank_redeem_bond($1, $2, $3)`,
      [actor, bondId, key],
    );
  }

  // Pocket (Saving Pockets) Operations
  async listPockets(actor: unknown): Promise<unknown[]> {
    assertUuid(actor, 'actor');
    return queryRows(
      this.pool,
      `SELECT pocket_id::text, name, balance::text, target_amount::text,
              target_date, theme_color, icon_code, is_archived, created_at, updated_at
       FROM public.bank_list_pockets($1)`,
      [actor],
    );
  }

  async createPocket(
    actor: unknown,
    name: string,
    targetAmountStr?: string,
    targetDate?: string,
    themeColor?: string,
    iconCode?: string,
  ): Promise<unknown> {
    assertUuid(actor, 'actor');
    const targetAmount = targetAmountStr ? assertAmount(targetAmountStr, 'target amount').toString() : null;

    return queryOne(
      this.pool,
      `SELECT pocket_id::text, name, balance::text, target_amount::text,
              target_date, theme_color, icon_code, is_archived, created_at
       FROM public.bank_create_saving_pocket($1, $2, $3, $4, $5, $6)`,
      [actor, name, targetAmount, targetDate || null, themeColor || 'sky', iconCode || 'piggy-bank'],
    );
  }

  async transferPocket(
    key: unknown,
    actor: unknown,
    pocketId: unknown,
    direction: 'deposit' | 'withdraw',
    amountStr: unknown,
  ): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(pocketId, 'pocket id');
    const amount = assertAmount(amountStr, 'amount');

    return queryOne(
      this.pool,
      `SELECT pocket_id::text, pocket_name, new_pocket_balance::text,
              new_cash_balance::text, transfer_amount::text, direction
       FROM public.bank_transfer_pocket($1, $2, $3, $4, $5)`,
      [key, actor, pocketId, direction, amount.toString()],
    );
  }

  async customizePocket(
    key: unknown,
    actor: unknown,
    pocketId: unknown,
    themeColor?: string,
    iconCode?: string,
  ): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(pocketId, 'pocket id');

    return queryOne(
      this.pool,
      `SELECT pocket_id::text, theme_color, icon_code, cost_wld::text, remaining_cash::text
       FROM public.bank_customize_pocket($1, $2, $3, $4, $5)`,
      [key, actor, pocketId, themeColor || 'sky', iconCode || 'piggy-bank'],
    );
  }

  async archivePocket(key: unknown, actor: unknown, pocketId: unknown): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(pocketId, 'pocket id');

    return queryOne(
      this.pool,
      `SELECT pocket_id::text, returned_balance::text, cost_wld::text, new_cash_balance::text
       FROM public.bank_archive_pocket($1, $2, $3)`,
      [key, actor, pocketId],
    );
  }
}
