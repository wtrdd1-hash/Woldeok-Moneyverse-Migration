import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';
import { currentViewer } from '@/lib/viewer';
import { NO_SUMMARY } from '@/lib/wallet-summary';
import type { WalletSummary } from '@/lib/wallet-summary';

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

interface Overview {
  readonly balances: {
    readonly currency: string;
    readonly totalAvailableAmount: string;
  };
}

export async function GET(): Promise<NextResponse> {
  // A per-caller response, so it must never reach a shared cache.
  const headers = { 'cache-control': 'private, no-store' };

  const viewer = await currentViewer();
  if (!viewer.signedIn) return NextResponse.json(NO_SUMMARY, { headers });

  const wallet = await apiOrNull<Overview>('/api/v1/wallet');
  if (!wallet) {
    // Signed in, but the figure is not available. Saying so is different from
    // reporting a zero balance, and the page renders the two differently.
    return NextResponse.json({ ...NO_SUMMARY, signedIn: true }, { headers });
  }

  return NextResponse.json(
    {
      signedIn: true,
      currency: wallet.balances.currency,
      totalAvailableAmount: wallet.balances.totalAvailableAmount,
    } satisfies WalletSummary,
    { headers },
  );
}
