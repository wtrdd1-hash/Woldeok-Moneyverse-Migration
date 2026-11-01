/** Only selects image-attached posts inside the backend's latest-50 public window. */
export function parseBoardImageFilter(value: unknown): { imageOnly: boolean; invalid: boolean } {
  if (value === undefined) return { imageOnly: false, invalid: false };
  if (value === '1') return { imageOnly: true, invalid: false };
  return { imageOnly: false, invalid: true };
}
