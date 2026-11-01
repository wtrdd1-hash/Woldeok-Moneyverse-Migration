export const BOARD_CATEGORIES = ['analysis', 'question', 'journal', 'business', 'system'] as const;
export type BoardCategory = (typeof BOARD_CATEGORIES)[number];

/** Only applies to stock-tagged posts in the latest public 50-post snapshot. */
export function parseBoardCategory(value: unknown): { category: BoardCategory | null; invalid: boolean } {
  if (value === undefined) return { category: null, invalid: false };
  if (typeof value !== 'string' || !BOARD_CATEGORIES.some((category) => category === value)) {
    return { category: null, invalid: true };
  }
  return { category: value as BoardCategory, invalid: false };
}
