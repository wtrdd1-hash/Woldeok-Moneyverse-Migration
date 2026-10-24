export type WalletPeriod = '7d' | '30d' | '90d';

/** Reject untrusted URL query values rather than forwarding them to the private API. */
export function walletPeriodFromSearchParam(value: unknown): WalletPeriod | null {
  return value === '7d' || value === '30d' || value === '90d' ? value : null;
}

export function walletPeriodHref(period: WalletPeriod | null): string {
  return period === null ? '/wallet/activity' : `/wallet/activity?period=${period}`;
}
