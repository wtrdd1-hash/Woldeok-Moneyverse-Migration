/** Only the three server-supported, read-only owner-ledger windows are linkable. */
export type ActivityPeriod = 'all' | '7d' | '30d';

export function activityPeriod(value: string | undefined): ActivityPeriod {
  return value === '7d' || value === '30d' ? value : 'all';
}

export function activityPeriodUrl(period: ActivityPeriod): string {
  return period === 'all' ? '/wallet/activity' : `/wallet/activity?period=${period}`;
}
