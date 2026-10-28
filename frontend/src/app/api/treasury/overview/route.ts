import { NextResponse } from 'next/server';
import { isLoggedInMember } from '@/lib/session';
import { buildUnverifiedTreasuryState } from '@/app/treasury/treasury-public-state';

export const dynamic = 'force-dynamic';

// Never represent administrator-only or demonstration figures as publicly verified fiscal truth.
export async function GET() {
  const state = buildUnverifiedTreasuryState(await isLoggedInMember());
  return NextResponse.json(
    { ok: false, status: 'UNVERIFIED', code: 'PUBLIC_TREASURY_RECONCILIATION_PENDING', ...state },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
