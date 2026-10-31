export type SeasonRankLimit = 3 | 10 | 20;

export function parseSeasonRankWindow(value: string | string[] | undefined): {
  limit: SeasonRankLimit;
  invalid: boolean;
} {
  if (value === undefined) return { limit: 20, invalid: false };
  if (value === '3') return { limit: 3, invalid: false };
  if (value === '10') return { limit: 10, invalid: false };
  if (value === '20') return { limit: 20, invalid: false };
  return { limit: 20, invalid: true };
}

export function seasonRankHref(eventId: string, limit: SeasonRankLimit): string {
  return `/seasons?event=${encodeURIComponent(eventId)}&limit=${limit}`;
}
