import { NextResponse } from 'next/server';
import { isLoggedInMember } from '@/lib/session';
import { loadTreasuryPublicState } from '@/app/treasury/treasury-verified-state';

export const dynamic = 'force-dynamic';

/** Only DB-certified current fiscal balances are disclosed; payouts remain held. */
export async function GET() {
  const state = await loadTreasuryPublicState(await isLoggedInMember());
  return NextResponse.json(state, {
    status: state.ok ? 200 : 503,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
