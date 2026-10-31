/** Read-only owner alert condition filter; never accept repeated URL parameters. */
export type AlertStatus = 'all' | 'met' | 'watching';
export function alertStatus(value: string | readonly string[] | undefined): AlertStatus | null {
  if (value === undefined) return 'all';
  return value === 'all' || value === 'met' || value === 'watching' ? value : null;
}
export function alertStatusUrl(status: AlertStatus): string {
  return status === 'all' ? '/api/v1/stocks/alerts' : `/api/v1/stocks/alerts?status=${status}`;
}
