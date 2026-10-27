import type { AdminUser } from '../types';

export interface AdminMemberSnapshotScope {
  readonly kind: 'WEALTH_ORDERED_SNAPSHOT';
  readonly limit: 50;
  readonly hasMore: boolean;
}

export interface VerifiedAdminMemberSnapshot {
  readonly users: readonly AdminUser[];
  readonly scope: AdminMemberSnapshotScope;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTEGER = /^-?(0|[1-9][0-9]*)$/;
const MONEY_FIELDS = ['cash_balance', 'bank_balance', 'bond_balance', 'stock_eval', 'total_net_worth'] as const;
const DATE_FIELDS = ['created_at', 'restricted_at', 'last_login_at', 'last_seen_at', 'last_admin_at'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validDate(value: unknown): boolean {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function validMember(value: unknown): value is AdminUser {
  if (!isRecord(value)) return false;
  if (typeof value.user_id !== 'string' || !UUID.test(value.user_id)) return false;
  if (typeof value.display_name !== 'string' || value.display_name.trim().length === 0) return false;
  if (typeof value.status !== 'string' || value.status.length === 0) return false;
  if (value.restricted_at === undefined || value.restriction_reason === undefined) return false;
  if (value.restriction_reason !== null && typeof value.restriction_reason !== 'string') return false;
  for (const field of DATE_FIELDS) {
    const date = value[field];
    if (field === 'created_at' && !validDate(date)) return false;
    if (field === 'restricted_at' && date !== null && !validDate(date)) return false;
    if (field !== 'created_at' && field !== 'restricted_at' && date != null && !validDate(date)) return false;
  }
  for (const field of MONEY_FIELDS) {
    const amount = value[field];
    if (typeof amount !== 'string' || !INTEGER.test(amount)) return false;
  }
  if (value.wealth_rank != null && (!Number.isSafeInteger(value.wealth_rank) || (value.wealth_rank as number) < 1)) return false;
  if (value.is_admin !== undefined && typeof value.is_admin !== 'boolean') return false;
  return true;
}

/** A bounded read is not a population count; reject responses that omit proof of its scope. */
export function parseAdminUserSnapshot(value: unknown): VerifiedAdminMemberSnapshot | null {
  if (!isRecord(value) || !Array.isArray(value.users) || !isRecord(value.scope)) return null;
  const scope = value.scope;
  if (scope.kind !== 'WEALTH_ORDERED_SNAPSHOT' || scope.limit !== 50 || typeof scope.hasMore !== 'boolean') return null;
  if (value.users.length > 50 || (scope.hasMore && value.users.length !== 50)) return null;
  if (!value.users.every(validMember)) return null;
  const ids = value.users.map((user: AdminUser) => user.user_id);
  if (new Set(ids).size !== ids.length) return null;
  return { users: value.users as AdminUser[], scope: scope as unknown as AdminMemberSnapshotScope };
}
