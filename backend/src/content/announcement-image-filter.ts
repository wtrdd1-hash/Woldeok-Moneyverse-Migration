import { BadRequestException } from '@nestjs/common';

/** Only the exact opt-in value is supported; duplicate query keys become arrays in Nest. */
export function parseAnnouncementImageQuery(query: Record<string, unknown> = {}): boolean {
  if (Object.keys(query).some((key) => key !== 'withImage') ||
      (query.withImage !== undefined && query.withImage !== '1')) {
    throw new BadRequestException('invalid announcement image filter');
  }
  return query.withImage === '1';
}
