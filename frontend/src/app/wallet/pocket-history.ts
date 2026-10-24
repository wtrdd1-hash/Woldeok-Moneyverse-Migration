import { isCanonicalWld, pocketBreakdown, type TransactionView } from './sides';

export type SelectedPocket = 'all' | 'cash' | 'bank';

/** Invalid user-supplied filters fail closed; never silently display another pocket. */
export function selectedPocket(value: unknown): SelectedPocket | null {
  if (value === undefined) return 'all';
  if (value === 'cash' || value === 'bank') return value;
  return null;
}

export function pocketHistoryHref(pocket: SelectedPocket): string {
  return pocket === 'all' ? '/wallet/activity' : `/wallet/activity?pocket=${pocket}`;
}

/** Signed owner-pocket delta; never show a fabricated zero on incomplete data. */
export function selectedPocketDelta(entry: TransactionView, pocket: SelectedPocket): string | null {
  if (pocket === 'all') return isCanonicalWld(entry.netAmount) ? entry.netAmount : null;
  const deltas = pocketBreakdown(entry);
  if (!deltas) return null;
  return pocket === 'cash' ? deltas.cashDelta : deltas.bankDelta;
}
