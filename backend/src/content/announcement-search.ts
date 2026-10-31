import { BadRequestException } from '@nestjs/common';

/** Search only the canonical published recent-20 announcement read; no raw table reads. */
export function parseAnnouncementSearch(query: Record<string, unknown> = {}): string | null {
  if (!query || typeof query !== 'object' || Array.isArray(query) ||
      Object.keys(query).some((key) => key !== 'q')) {
    throw new BadRequestException('only the announcement title query is supported');
  }
  const raw = query.q;
  if (raw === undefined) return null;
  if (typeof raw !== 'string' || /[\u0000-\u001f\u007f]/u.test(raw)) {
    throw new BadRequestException('invalid announcement title query');
  }
  const normalized = raw.trim().normalize('NFC');
  if ([...normalized].length < 2 || [...normalized].length > 40) {
    throw new BadRequestException('announcement title query must be 2–40 characters');
  }
  return normalized;
}
