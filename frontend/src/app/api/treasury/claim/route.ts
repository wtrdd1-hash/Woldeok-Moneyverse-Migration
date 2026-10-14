import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// A claim must never acknowledge money that was not settled in the ledger.
export async function POST(_request: Request) {
  return NextResponse.json(
    { ok: false, message: '국고 혜택 수령 기능은 실제 원장 정산 검증 전까지 일시 중단되었습니다.' },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
