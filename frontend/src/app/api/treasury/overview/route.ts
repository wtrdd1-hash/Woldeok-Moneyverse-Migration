import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Public financial evidence cannot come from privileged admin endpoints,
// hard-coded recipient counts, synthetic payouts, or assumed wallet balances.
// Restore only when a scoped public ledger read-model passes accounting audits.
export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      status: 'FINANCIAL_LEDGER_UNVERIFIED',
      message: '국고 회계 원장 대사와 지급내역 검증이 완료될 때까지 재정 통계를 제공하지 않습니다.',
      overview: null,
      recentLedger: [],
      userEligibility: null,
    },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
