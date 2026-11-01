import { BadRequestException } from '@nestjs/common';

/** The only accepted search parameter; the database still selects published rows first. */
export function parseAnnouncementBodyFilter(query: unknown): string | null {
  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    throw new BadRequestException('invalid announcement query');
  }
  const values = query as Record<string, unknown>;
  if (Object.keys(values).some((key) => key !== 'body')) {
    throw new BadRequestException('unsupported announcement query');
  }
  if (!Object.hasOwn(values, 'body')) return null;
  const value = values.body;
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 80 ||
      /[<>\u0000-\u001f\u007f]/.test(value)) {
    throw new BadRequestException('body must be 1–80 safe characters');
  }
  return value.trim();
}

export function filterPublishedAnnouncementBodies<T extends { readonly body: string }>(
  rows: readonly T[], body: string | null,
): T[] {
  if (body === null) return [...rows];
  const needle = body.toLocaleLowerCase('ko-KR');
  return rows.filter((row) => row.body.toLocaleLowerCase('ko-KR').includes(needle));
}
