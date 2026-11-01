import { BadRequestException } from '@nestjs/common';

/** A public day is a Gregorian calendar date in Asia/Seoul, never a timestamp. */
export function parseGalleryDay(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
}

/** Reject ambiguous query arrays and unsupported keys rather than silently ignoring them. */
export function requireGalleryDayQuery(query: unknown): string | undefined {
  if (query === undefined) return undefined;
  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    throw new BadRequestException('invalid gallery day query');
  }
  const entries = Object.entries(query);
  if (entries.length === 0) return undefined;
  if (entries.length !== 1 || entries[0]?.[0] !== 'day') {
    throw new BadRequestException('only one gallery day is supported');
  }
  const day = parseGalleryDay(entries[0]?.[1]);
  if (!day) throw new BadRequestException('gallery day must be a valid YYYY-MM-DD');
  return day;
}

export function photoMatchesGalleryDay(publishedAt: string | null, day: string): boolean {
  if (!publishedAt) return false;
  const utc = Date.parse(publishedAt);
  return Number.isFinite(utc) && new Date(utc + 9 * 60 * 60 * 1000).toISOString().slice(0, 10) === day;
}
