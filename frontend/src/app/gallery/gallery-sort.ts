export type GallerySort = 'newest' | 'oldest';

export function parseGallerySort(value: unknown): { sort: GallerySort; invalid: boolean; filtered: boolean } {
  if (value === undefined) return { sort: 'newest', invalid: false, filtered: false };
  if (value === 'newest' || value === 'oldest') return { sort: value, invalid: false, filtered: true };
  return { sort: 'newest', invalid: true, filtered: true };
}
