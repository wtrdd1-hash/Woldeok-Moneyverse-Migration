import type { SavingPocket } from './types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WLD = /^(0|[1-9][0-9]{0,18})$/;
const MAX_BIGINT = 9223372036854775807n;
function canonicalAmount(value: unknown, positive = false): value is string {
  return typeof value === 'string' && WLD.test(value) && BigInt(value) <= MAX_BIGINT &&
    (!positive || value !== '0');
}
const SAFE_CODE = /^[a-z][a-z0-9-]{0,31}$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function dateTime(value: unknown): value is string {
  return typeof value === 'string' && ISO.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}

function targetDate(value: unknown): value is string | null {
  if (value === null) return true;
  if (dateTime(value)) return true;
  return typeof value === 'string' && DATE.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
}

/**
 * The Nest owner endpoint returns rows from bank_list_pockets(actor).
 * Never confuse an upstream failure or a malformed success with a verified
 * empty list. Project allowlisted fields so Android cannot receive extras.
 */
export function parseSavingPockets(payload: unknown): SavingPocket[] | null {
  if (!Array.isArray(payload) || payload.length > 10_000) return null;
  const seen = new Set<string>();
  const result: SavingPocket[] = [];
  for (const item of payload) {
    if (!record(item) ||
        typeof item.pocket_id !== 'string' || !UUID.test(item.pocket_id) ||
        seen.has(item.pocket_id.toLowerCase()) ||
        typeof item.name !== 'string' || !item.name.trim() || item.name.length > 64 ||
        !canonicalAmount(item.balance) ||
        (item.target_amount !== null &&
          (!canonicalAmount(item.target_amount, true))) ||
        !targetDate(item.target_date) ||
        typeof item.theme_color !== 'string' || !SAFE_CODE.test(item.theme_color) ||
        typeof item.icon_code !== 'string' || !SAFE_CODE.test(item.icon_code) ||
        typeof item.is_archived !== 'boolean' ||
        !dateTime(item.created_at) || !dateTime(item.updated_at)) return null;
    seen.add(item.pocket_id.toLowerCase());
    result.push({
      pocket_id: item.pocket_id,
      name: item.name,
      balance: item.balance,
      target_amount: item.target_amount,
      target_date: item.target_date,
      theme_color: item.theme_color,
      icon_code: item.icon_code,
      is_archived: item.is_archived,
      created_at: item.created_at,
      updated_at: item.updated_at,
    });
  }
  return result;
}
