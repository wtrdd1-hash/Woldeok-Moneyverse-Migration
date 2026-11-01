import { BadRequestException } from '@nestjs/common';

export type AnnouncementOrder = 'pinned' | 'newest' | 'oldest';

/** Reject duplicate or unexpected query keys rather than silently ignoring them. */
export function parseAnnouncementOrder(query: unknown): AnnouncementOrder {
  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    throw new BadRequestException('invalid announcement query');
  }
  const values = query as Record<string, unknown>;
  if (Object.keys(values).some((key) => key !== 'sort')) {
    throw new BadRequestException('unsupported announcement query');
  }
  if (!Object.hasOwn(values, 'sort')) return 'pinned';
  if (values.sort === 'pinned' || values.sort === 'newest' || values.sort === 'oldest') return values.sort;
  throw new BadRequestException('sort must be pinned, newest or oldest');
}

/** Reorder only the DB-owned published, pinned-first snapshot, never all history. */
export function orderPublishedAnnouncements<T extends { announcementId: string; publishedAt: string | null }>(
  rows: readonly T[], order: AnnouncementOrder,
): T[] {
  if (order === 'pinned') return [...rows];
  if (rows.some((row) => !row.publishedAt || !Number.isFinite(Date.parse(row.publishedAt)))) {
    throw new Error('published announcement timestamp unavailable');
  }
  return [...rows].sort((a, b) => {
    const left = Date.parse(a.publishedAt!);
    const right = Date.parse(b.publishedAt!);
    if (left !== right) return order === 'newest' ? right - left : left - right;
    return order === 'newest'
      ? b.announcementId.localeCompare(a.announcementId)
      : a.announcementId.localeCompare(b.announcementId);
  });
}
