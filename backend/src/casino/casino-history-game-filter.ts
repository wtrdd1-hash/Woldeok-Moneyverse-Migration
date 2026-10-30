/** Only the canonical member_casino_history game vocabulary is selectable. */
export const CASINO_HISTORY_GAMES = [
  'coin', 'dice_parity', 'dice_number',
] as const;
export type CasinoHistoryGame = 'all' | (typeof CASINO_HISTORY_GAMES)[number];

export function parseCasinoHistoryGame(value: unknown): CasinoHistoryGame | null {
  if (value === undefined) return 'all';
  if (typeof value !== 'string' || !value) return null;
  if (value === 'all') return 'all';
  return CASINO_HISTORY_GAMES.some((game) => game === value) ? value as CasinoHistoryGame : null;
}
