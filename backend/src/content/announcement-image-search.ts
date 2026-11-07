import { BadRequestException } from '@nestjs/common';

export function parseAnnouncementImageSearch(query: Record<string, unknown>): string | undefined {
  if (Object.keys(query).some((key) => key !== 'imageAlt')) {
    throw new BadRequestException('invalid announcement image search');
  }
  const value = query.imageAlt;
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new BadRequestException('invalid announcement image search');
  const term = value.trim();
  if (
    Array.from(term).length < 2 ||
    Array.from(term).length > 80 ||
    /[<>\u0000-\u001f\u007f]/u.test(term)
  ) throw new BadRequestException('invalid announcement image search');
  return term;
}
