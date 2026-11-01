import { NextResponse } from 'next/server';
import { isLoggedInMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

export async function POST(req: Request): Promise<NextResponse> {
  const origin = req.headers.get('origin');
  const site = req.headers.get('sec-fetch-site');
  if (!origin || origin !== new URL(req.url).origin || (site !== null && site !== 'same-origin')) {
    return NextResponse.json({ success: false, error: 'forbidden_origin' }, { status: 403, headers: PRIVATE_HEADERS });
  }
  try {
    if (!(await isLoggedInMember())) {
      return NextResponse.json({ success: false, error: 'authentication_required' }, { status: 401, headers: PRIVATE_HEADERS });
    }
  } catch {
    return NextResponse.json({ success: false, error: 'session_unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
  // No audited, actor-scoped PostgreSQL settlement function exists for this route.
  // Never synthesize filled trades, discounts or receipts from user-provided ratios.
  return NextResponse.json({ success: false, error: 'ADVISOR_REBALANCE_UNVERIFIED' },
    { status: 503, headers: PRIVATE_HEADERS });
}
