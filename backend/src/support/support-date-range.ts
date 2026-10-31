import { BadRequestException } from '@nestjs/common';

export interface SupportKstRange {
  readonly fromUtc: string;
  readonly toUtcExclusive: string;
}

function utcDay(value: unknown): number | null {
  if (typeof value !== 'string' || !/^20\d\d-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(value)) return null;
  const day = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(day) && new Date(day).toISOString().slice(0, 10) === value ? day : null;
}

/** A window is applied only after the owner-scoped latest-100 database read. */
export function parseSupportKstRange(from?: unknown, to?: unknown): SupportKstRange | undefined {
  if (from === undefined && to === undefined) return undefined;
  const first = utcDay(from);
  const last = utcDay(to);
  if (first === null || last === null || first > last || (last - first) / 86_400_000 >= 366) {
    throw new BadRequestException('invalid support date range');
  }
  return {
    fromUtc: new Date(first - 9 * 3_600_000).toISOString(),
    toUtcExclusive: new Date(last + 86_400_000 - 9 * 3_600_000).toISOString(),
  };
}
