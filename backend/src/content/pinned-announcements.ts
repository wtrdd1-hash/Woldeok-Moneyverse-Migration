import { BadRequestException } from '@nestjs/common';

/** A public filter must be a single canonical value, never an array coerced to a string. */
export function parsePinnedOnlyQuery(value: unknown): boolean {
  if (value === undefined || value === 'false') return false;
  if (value === 'true') return true;
  throw new BadRequestException('pinned must be true or false when provided');
}
