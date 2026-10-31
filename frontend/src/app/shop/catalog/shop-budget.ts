/** The catalogue's SQL bigint price is a canonical decimal string, never a JS number. */
const MAX_WLD = 9223372036854775807n;
const CANONICAL_WLD = /^(0|[1-9][0-9]{0,18})$/;

export type MemberShopBudget =
  | { readonly valid: true; readonly amount: string | null }
  | { readonly valid: false; readonly amount: null };

export function parseMemberShopBudget(value: unknown): MemberShopBudget {
  if (value === undefined || value === '') return { valid: true, amount: null };
  if (typeof value !== 'string' || !CANONICAL_WLD.test(value) || BigInt(value) > MAX_WLD) {
    return { valid: false, amount: null };
  }
  return { valid: true, amount: value };
}

export function memberShopBudgetUrl(amount: string | null): string {
  return amount === null ? '/api/v1/shop/catalog' :
    `/api/v1/shop/catalog?maxPrice=${encodeURIComponent(amount)}`;
}
