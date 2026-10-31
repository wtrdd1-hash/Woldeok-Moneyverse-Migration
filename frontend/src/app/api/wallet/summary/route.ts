import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';
import { currentViewer } from '@/lib/viewer';
import { NO_SUMMARY } from '@/lib/wallet-summary';
import type { WalletSummary } from '@/lib/wallet-summary';
import { isWldAmount } from '@moneyverse/contract';

/**
 * The one figure the landing page shows a signed-in member: their balance.
 *
 * The home page is statically generated so a crawler receives finished HTML
 * and a first-time visitor gets an instant paint. That rules out reading the
 * session during render, so the balance is fetched after hydration instead —
 * this is the route that answers.
 *
 * It reports only what the caller's own cookie already proves. The API
 * re-decides the permission on its side; a signed-out caller gets `signedIn:
 * false` here because the API refused, not because this route decided.
 */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  // A per-caller response, so it must never reach a shared cache.
  const headers = {
    'cache-control': 'private, no-store',
    'x-robots-tag': 'noindex',
    'referrer-policy': 'no-referrer',
  };

  const viewer = await currentViewer();
  if (!viewer.signedIn) return NextResponse.json(NO_SUMMARY, { headers });

  const wallet = await apiOrNull<unknown>('/api/v1/wallet');
  const balances = wallet && typeof wallet === 'object' && !Array.isArray(wallet) && 'balances' in wallet
    ? wallet.balances : null;
  if (!balances || typeof balances !== 'object' || Array.isArray(balances) ||
      !('currency' in balances) || balances.currency !== 'WLD' ||
      !('totalAvailableAmount' in balances) || !isWldAmount(balances.totalAvailableAmount)) {
    // Signed in, but the figure is not available. Saying so is different from
    // reporting a zero balance, and the page renders the two differently.
    return NextResponse.json({ ...NO_SUMMARY, signedIn: true }, { headers });
  }

  return NextResponse.json(
    {
      signedIn: true,
      currency: balances.currency,
      totalAvailableAmount: balances.totalAvailableAmount,
    } satisfies WalletSummary,
    { headers },
  );
}
