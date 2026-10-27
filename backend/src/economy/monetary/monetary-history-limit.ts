import { BadRequestException } from '@nestjs/common';

/** Admin-only monetary history requests use one exact bounded decimal contract. */
export function parseMonetaryHistoryLimit(raw: unknown): number {
  if (raw === undefined) return 20;
  if (typeof raw !== 'string' || !/^[1-9][0-9]*$/.test(raw)) {
    throw new BadRequestException('limit must be a decimal integer between 1 and 50');
  }
  return requireMonetaryHistoryLimit(Number(raw));
}

/** Guard service callers too: a controller is not the only possible entry point. */
export function requireMonetaryHistoryLimit(limit: number): number {
  if (typeof limit !== 'number' || !Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
    throw new BadRequestException('limit must be a decimal integer between 1 and 50');
  }
  return limit;
}
