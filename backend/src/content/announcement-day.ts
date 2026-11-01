import { ContentInputError } from './content.repository';

export interface AnnouncementDayRange {
  readonly day: string;
  readonly fromUtc: string;
  readonly toUtc: string;
}

/** Seoul has a fixed UTC+09 offset; use UTC arithmetic to reject calendar rollover. */
export function seoulAnnouncementDay(value: unknown): AnnouncementDayRange | null {
  if (value === undefined) return null;
  if (typeof value !== 'string' || !/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(value)) {
    throw new ContentInputError('publication day must be YYYY-MM-DD');
  }
  const [year, month, day] = value.split('-').map(Number);
  const midnight = Date.UTC(year!, month! - 1, day!);
  if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== value) {
    throw new ContentInputError('publication day is not a valid calendar date');
  }
  const start = midnight - 9 * 60 * 60 * 1000;
  return {
    day: value,
    fromUtc: new Date(start).toISOString(),
    toUtc: new Date(start + 24 * 60 * 60 * 1000).toISOString(),
  };
}
