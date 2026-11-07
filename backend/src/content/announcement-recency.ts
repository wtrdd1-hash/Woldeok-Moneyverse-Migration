import { BadRequestException } from '@nestjs/common';

export type AnnouncementRecency = '7d' | '30d';

export function parseAnnouncementRecency(value: unknown): AnnouncementRecency | null {
  if (value === undefined) return null;
  if (value === '7d' || value === '30d') return value;
  throw new BadRequestException('recent must be 7d or 30d');
}

export function announcementRecencyWindow(
  recent: AnnouncementRecency,
  publishedAt: string | null,
  asOf: Date,
): boolean {
  if (publishedAt === null) throw new Error('published announcement has no verified publication time');
  const time = Date.parse(publishedAt);
  const now = asOf.getTime();
  if (!Number.isFinite(time) || !Number.isFinite(now)) {
    throw new Error('announcement recency cannot be verified');
  }
  const days = recent === '7d' ? 7 : 30;
  return time <= now && time >= now - days * 86_400_000;
}
