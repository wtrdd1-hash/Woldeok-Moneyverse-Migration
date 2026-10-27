import type { AdminUser } from '../../types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WLD = /^(?:0|[1-9][0-9]{0,37}|-[1-9][0-9]{0,37})$/;
const STATUS = /^[a-z][a-z_]{0,39}$/;

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function timestamp(value: unknown): value is string {
  return typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    Number.isFinite(Date.parse(value));
}

function exactAmount(value: unknown): value is string {
  return typeof value === 'string' && WLD.test(value);
}

/** Only the actor-checked member-specific PostgreSQL read proves identity.
 * The directory is capped and may not include this user; JSON numeric balances
 * from the portfolio are not an exact WLD representation.
 */
export function resolveAdminMemberDetail(
  userId: string,
  portfolioResponse: unknown,
  directoryResponse: unknown,
): AdminUser | null {
  if (!UUID.test(userId)) return null;
  const payload = record(portfolioResponse);
  const profile = record(payload?.portfolio);
  if (!profile || typeof profile.userId !== 'string' ||
      profile.userId.toLowerCase() !== userId.toLowerCase() ||
      typeof profile.displayName !== 'string' ||
      profile.displayName.trim().length === 0 || profile.displayName.length > 200 ||
      /[\u0000-\u001f\u007f]/.test(profile.displayName) ||
      typeof profile.status !== 'string' || !STATUS.test(profile.status) ||
      !timestamp(profile.createdAt) ||
      (profile.restrictedAt !== null && !timestamp(profile.restrictedAt)) ||
      (profile.restrictionReason !== null &&
        (typeof profile.restrictionReason !== 'string' || profile.restrictionReason.length > 1000))) {
    return null;
  }

  const response = record(directoryResponse);
  const rows = Array.isArray(response?.users) && response.users.length <= 200
    ? response.users.map(record).filter((row) => row?.user_id === userId)
    : [];
  const financial = rows.length === 1 ? rows[0] : null;

  return {
    user_id: userId,
    display_name: profile.displayName,
    status: profile.status,
    created_at: profile.createdAt,
    restricted_at: profile.restrictedAt,
    restriction_reason: profile.restrictionReason,
    ...(exactAmount(financial?.cash_balance) ? { cash_balance: financial.cash_balance } : {}),
    ...(exactAmount(financial?.bank_balance) ? { bank_balance: financial.bank_balance } : {}),
    ...(exactAmount(financial?.bond_balance) ? { bond_balance: financial.bond_balance } : {}),
    ...(exactAmount(financial?.stock_eval) ? { stock_eval: financial.stock_eval } : {}),
    ...(exactAmount(financial?.total_net_worth) ? { total_net_worth: financial.total_net_worth } : {}),
    ...(typeof financial?.wealth_rank === 'number' &&
      Number.isSafeInteger(financial.wealth_rank) && financial.wealth_rank > 0
      ? { wealth_rank: financial.wealth_rank }
      : {}),
  };
}
