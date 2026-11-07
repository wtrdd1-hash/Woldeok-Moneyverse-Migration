export type BoardPosition = 'holder' | 'no_position' | 'operator_related' | 'undisclosed';

/** Only self-declared disclosures within the recent public snapshot, never verified holdings. */
export function parseBoardPositionFilter(value: unknown): { position: BoardPosition | null; invalid: boolean } {
  if (value === undefined) return { position: null, invalid: false };
  if (value === 'holder' || value === 'no_position' || value === 'operator_related' || value === 'undisclosed') {
    return { position: value, invalid: false };
  }
  return { position: null, invalid: true };
}
