/** The only casino receipts shown as settled are the bounded, owner-scoped SQL read model. */
export interface CasinoHistoryEntry {
  readonly play_id: string;
  readonly game: 'coin' | 'dice_parity' | 'dice_number';
  readonly choice: string;
  readonly outcome: string;
  readonly stake_amount: string;
  readonly net_amount: string;
  readonly transaction_id: string;
  readonly played_at: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NATURAL = /^(0|[1-9][0-9]*)$/;
const SIGNED = /^-?(0|[1-9][0-9]*)$/;
const MAX = 9223372036854775807n;
const MIN = -9223372036854775808n;

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function money(value: unknown, signed: boolean): value is string {
  if (typeof value !== 'string' || !(signed ? SIGNED : NATURAL).test(value)) return false;
  const n = BigInt(value);
  return n >= (signed ? MIN : 1n) && n <= MAX;
}

function time(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed) || parsed > Date.now() + 300_000) return false;
  // Date.parse normalizes invalid calendar dates such as February 30.
  const day = value.slice(0, 10);
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day;
}

function validRow(row: unknown): row is CasinoHistoryEntry {
  if (!object(row) || typeof row.play_id !== 'string' || !UUID.test(row.play_id)
    || typeof row.transaction_id !== 'string' || !UUID.test(row.transaction_id)
    || !money(row.stake_amount, false) || !money(row.net_amount, true)
    || BigInt(row.net_amount) < -BigInt(row.stake_amount)
    || !time(row.played_at)) return false;
  if (row.game === 'coin') {
    return (row.choice === 'heads' || row.choice === 'tails')
      && (row.outcome === 'heads' || row.outcome === 'tails');
  }
  if (row.game === 'dice_parity') {
    return (row.choice === 'odd' || row.choice === 'even')
      && typeof row.outcome === 'string' && /^[1-6]$/.test(row.outcome);
  }
  if (row.game === 'dice_number') {
    return typeof row.choice === 'string' && /^[1-6]$/.test(row.choice)
      && typeof row.outcome === 'string' && /^[1-6]$/.test(row.outcome);
  }
  return false;
}

/** Invalid evidence is unknown, never a verified empty history or a settlement receipt. */
export function parseCasinoHistory(value: unknown): CasinoHistoryEntry[] | null {
  if (!Array.isArray(value) || value.length > 20) return null;
  const ids = new Set<string>();
  const transactions = new Set<string>();
  let last = Infinity;
  for (const row of value) {
    if (!validRow(row)) return null;
    const id = row.play_id.toLowerCase();
    const tx = row.transaction_id.toLowerCase();
    const stamp = Date.parse(row.played_at);
    if (ids.has(id) || transactions.has(tx) || stamp > last) return null;
    ids.add(id);
    transactions.add(tx);
    last = stamp;
  }
  return value as CasinoHistoryEntry[];
}
