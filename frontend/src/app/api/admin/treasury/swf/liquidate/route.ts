import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// No canonical ledger settlement receipt exists for manual SWF liquidation.
// Never parse or forward a request, even if the caller bypasses the admin UI.
export async function POST(_request: Request) {
  return NextResponse.json(
    {
      success: false,
      code: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE',
      error: '국부펀드 수동 회수는 원장 정산 및 검증 가능한 영수증 구현 전까지 중단됩니다.',
    },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
