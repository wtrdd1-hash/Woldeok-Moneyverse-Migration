import { BadRequestException } from '@nestjs/common';

/** Search only the newest 24 already-approved photos, never the full archive. */
export function parseGalleryCaptionQuery(raw: unknown): string | null {
  if (raw === undefined) return null;
  if (typeof raw !== 'string') throw new BadRequestException('gallery query must be a single string');
  if (/[\u0000-\u001f\u007f]/u.test(raw)) throw new BadRequestException('gallery query contains control characters');
  const query = raw.trim();
  const length = [...query].length;
  if (length < 2 || length > 40 || /[\u0000-\u001f\u007f]/u.test(query)) {
    throw new BadRequestException('gallery query must be 2-40 printable characters');
  }
  return query;
}
