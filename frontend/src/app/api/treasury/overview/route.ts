import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// The only existing treasury overview is admin-guarded. A public endpoint must
// not bypass that authorization or manufacture ledger-backed fiscal evidence.
export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      code: 'TREASURY_PUBLIC_DISCLOSURE_UNAVAILABLE',
      message: '국고 공개 잔액 및 지출 원장은 검증된 공개 조회 계약이 준비될 때까지 제공되지 않습니다.',
      overview: null,
      recentLedger: [],
      userEligibility: null,
    },
    {
      status: 503,
      headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' },
    },
  );
}
