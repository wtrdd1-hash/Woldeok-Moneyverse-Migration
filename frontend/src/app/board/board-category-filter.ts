/** Stock-linked category among the latest 50 public posts; not an archive-wide search. */
export type BoardCategory = 'analysis' | 'question' | 'journal' | 'business' | 'system';
const CATEGORIES: readonly string[] = ['analysis', 'question', 'journal', 'business', 'system'];

export function parseBoardCategory(value: unknown): { category: BoardCategory | null; invalid: boolean } {
  if (value === undefined || value === '') return { category: null, invalid: false };
  if (typeof value !== 'string' || !CATEGORIES.includes(value)) {
    return { category: null, invalid: true };
  }
  return { category: value as BoardCategory, invalid: false };
}
