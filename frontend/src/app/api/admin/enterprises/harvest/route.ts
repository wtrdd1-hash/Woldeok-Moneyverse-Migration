import { NextResponse } from 'next/server';

// P0 #1080: no proxy path may invoke non-atomic SOE dividend remittance.
export async function POST() {
  return NextResponse.json(
    {
      code: 'SOE_DIVIDEND_LEDGER_UNAVAILABLE',
      error: '원장 정산 검증 전까지 공기업 배당 수취가 중지되었습니다.',
    },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
