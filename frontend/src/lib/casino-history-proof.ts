/** Read-only proof for the last 20 owner-scoped arcade plays. */
export const CASINO_HISTORY_GAMES = [
  'coin', 'dice_parity', 'dice_number',
] as const;
export type CasinoHistoryGame = 'all' | (typeof CASINO_HISTORY_GAMES)[number];
export type CasinoHistoryEntry = Readonly<{
  play_id: string;
  game: (typeof CASINO_HISTORY_GAMES)[number];
  choice: string;
  outcome: string;
  stake_amount: string;
  net_amount: string;
  transaction_id: string;
  played_at: string;
}>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UNSIGNED_WLD = /^(0|[1-9][0-9]{0,29})$/;
const SIGNED_WLD = /^(0|-?[1-9][0-9]{0,29})$/;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/;

export function parseCasinoHistoryGame(value: unknown): CasinoHistoryGame | null {
  if (value === undefined) return 'all';
  if (typeof value !== 'string' || !value) return null;
  if (value === 'all') return 'all';
  return CASINO_HISTORY_GAMES.some((game) => game === value) ? value as CasinoHistoryGame : null;
}

export function parseVerifiedCasinoHistory(value: unknown, game: CasinoHistoryGame): CasinoHistoryEntry[] | null {
  if (!Array.isArray(value) || value.length > 20) return null;
  const seen = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const row = item as Record<string, unknown>;
    if (typeof row.play_id !== 'string' || !UUID.test(row.play_id) || seen.has(row.play_id)) return null;
    if (typeof row.transaction_id !== 'string' || !UUID.test(row.transaction_id)) return null;
    if (typeof row.game !== 'string' || !CASINO_HISTORY_GAMES.some((known) => known === row.game) ||
        (game !== 'all' && row.game !== game)) return null;
    if (typeof row.choice !== 'string' || row.choice.length > 100 ||
        typeof row.outcome !== 'string' || row.outcome.length > 100) return null;
    if (typeof row.stake_amount !== 'string' || !UNSIGNED_WLD.test(row.stake_amount) ||
        typeof row.net_amount !== 'string' || !SIGNED_WLD.test(row.net_amount)) return null;
    if (typeof row.played_at !== 'string' || !ISO_UTC.test(row.played_at) ||
        !Number.isFinite(Date.parse(row.played_at))) return null;
    seen.add(row.play_id);
  }
  return value as CasinoHistoryEntry[];
}
