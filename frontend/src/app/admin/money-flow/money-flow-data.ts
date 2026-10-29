/** Strictly validate the admin ledger projection before displaying it as financial evidence. */
export interface UserMoneyFlowItem {
  readonly transaction_id: string;
  readonly type: string;
  readonly user_id: string;
  readonly display_name: string;
  readonly account_type: string;
  readonly direction: 'debit' | 'credit';
  readonly amount: string;
  readonly created_at: string;
}

export interface UserMoneyFlowResponse {
  readonly items: readonly UserMoneyFlowItem[];
  readonly summary: {
    readonly total_volume_24h: string;
    readonly total_transactions_24h: number;
    readonly active_users_24h: number;
    readonly total_inflow_24h: string;
    readonly total_outflow_24h: string;
    readonly all_time_transactions?: number;
    readonly all_time_users?: number;
    readonly last_transaction_at?: string | null;
  };
  readonly next_cursor: string | null;
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function wld(value: unknown): value is string {
  return typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value) && value.length <= 38;
}

function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

// NestJS returns an opaque versioned keyset cursor, not a timestamp. Keep the
// envelope bounded; the API verifies its posting tie-breaker and filter digest.
function moneyFlowCursor(value: unknown): value is string {
  return typeof value === 'string' && /^mf1\.[A-Za-z0-9_-]{1,480}$/.test(value)
    && !/[\r\n]/.test(value);
}

function timestamp(value: unknown): value is string {
  return nonEmpty(value) && Number.isFinite(Date.parse(value));
}

function validItem(value: unknown): value is UserMoneyFlowItem {
  if (!record(value)) return false;
  return nonEmpty(value.transaction_id) && nonEmpty(value.type)
    && nonEmpty(value.user_id) && typeof value.display_name === 'string'
    && nonEmpty(value.account_type)
    && (value.direction === 'debit' || value.direction === 'credit')
    && wld(value.amount) && timestamp(value.created_at);
}

export function validateMoneyFlowResponse(value: unknown): UserMoneyFlowResponse | null {
  if (!record(value) || !Array.isArray(value.items) || value.items.length > 50
    || !value.items.every(validItem) || !record(value.summary)) return null;
  const s = value.summary;
  if (!wld(s.total_volume_24h) || !wld(s.total_inflow_24h) || !wld(s.total_outflow_24h)
    || !count(s.total_transactions_24h) || !count(s.active_users_24h)
    || (s.all_time_transactions !== undefined && !count(s.all_time_transactions))
    || (s.all_time_users !== undefined && !count(s.all_time_users))
    || (s.last_transaction_at !== undefined && s.last_transaction_at !== null && !timestamp(s.last_transaction_at))
    || (value.next_cursor !== null && !moneyFlowCursor(value.next_cursor))) return null;
  return value as unknown as UserMoneyFlowResponse;
}
