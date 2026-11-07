/** Image-only results are drawn from the latest twenty already-published notices. */
export function parseAnnouncementImageFilter(value: unknown): { imageOnly: boolean; invalid: boolean } {
  if (value === undefined) return { imageOnly: false, invalid: false };
  if (value === '1') return { imageOnly: true, invalid: false };
  return { imageOnly: false, invalid: true };
}
