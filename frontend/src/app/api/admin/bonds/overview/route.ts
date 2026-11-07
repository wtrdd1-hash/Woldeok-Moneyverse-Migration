import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { parseBondEvidence } from '@/app/admin/bonds/bond-evidence';

const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [overview, bonds, couponLogs] = await Promise.all([
      api('/api/v1/admin/bonds/overview'),
      api('/api/v1/admin/bonds/list'),
      api('/api/v1/admin/bonds/coupon-logs?limit=30'),
    ]);
    return NextResponse.json(parseBondEvidence({ overview, bonds, couponLogs }), {
      headers: privateHeaders,
    });
  } catch (error) {
    // Backend owns administrator authorization. Never reflect internal SQL or session diagnostics.
    const status = error instanceof ApiError && (error.status === 401 || error.status === 403)
      ? error.status : 503;
    return NextResponse.json(
      { error: status === 401 ? 'Administrator sign-in required' : status === 403 ? 'Administrator access denied' : 'Bond evidence unavailable' },
      { status, headers: privateHeaders },
    );
  }
}
