import { BadRequestException } from '@nestjs/common';

const MONTH = /^20[0-9]{2}-(0[1-9]|1[0-2])$/;
const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Validate the complete public filter; unknown/duplicate parameters are errors. */
export function parsePhotoMonth(query: Record<string, unknown>): string | null {
  const keys = Object.keys(query);
  if (keys.length === 0) return null;
  if (keys.length !== 1 || keys[0] !== 'month' ||
      typeof query.month !== 'string' || !MONTH.test(query.month)) {
    throw new BadRequestException('month must be a single YYYY-MM value (2000-2099)');
  }
  return query.month;
}

export function photoMatchesSeoulMonth(publishedAt: string | null, month: string): boolean {
  if (!publishedAt) return false;
  const timestamp = Date.parse(publishedAt);
  if (!Number.isFinite(timestamp)) return false;
  return new Date(timestamp + SEOUL_OFFSET_MS).toISOString().slice(0, 7) === month;
}
