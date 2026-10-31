import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import type { SeasonEventRow } from './season.service';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ISO_TIMEZONE = /(?:Z|[+-]\d{2}:\d{2})$/;
const EXACT_WLD = /^(0|[1-9]\d*)$/;

export function parseSeasonDeadlineFilter(value: unknown): '7d' | null {
  if (value === undefined) return null;
  if (value === '7d') return '7d';
  throw new BadRequestException('endingWithin must be 7d when supplied');
}

export function seasonDeadlineTimestamp(value: unknown): number | null {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null;
  if (typeof value !== 'string' || !ISO_TIMEZONE.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

export function filterSeasonDeadlineEvents(rows: readonly SeasonEventRow[], asOf: Date): SeasonEventRow[] {
  const start = asOf.getTime();
  if (!Number.isFinite(start) || !Array.isArray(rows)) {
    throw new ServiceUnavailableException('season event evidence is unavailable');
  }
  const selected: SeasonEventRow[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object' || typeof row.event_id !== 'string' || !row.event_id ||
        typeof row.season_id !== 'string' || !row.season_id ||
        typeof row.season_name !== 'string' || !row.season_name ||
        typeof row.title !== 'string' || !row.title ||
        typeof row.description !== 'string' ||
        typeof row.cost_wld !== 'string' || !EXACT_WLD.test(row.cost_wld) ||
        !Number.isSafeInteger(row.points_per_entry) || row.points_per_entry <= 0) {
      throw new ServiceUnavailableException('season event evidence is unavailable');
    }
    const end = seasonDeadlineTimestamp(row.ends_at);
    if (end === null) throw new ServiceUnavailableException('season event deadline is unavailable');
    if (end > start && end <= start + WEEK_MS) selected.push(row);
  }
  return selected.sort((a, b) => seasonDeadlineTimestamp(a.ends_at)! - seasonDeadlineTimestamp(b.ends_at)!);
}
