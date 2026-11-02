import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// The Nest source rejects subscriptions pending ledger-backed budget reservation.
// Reject at the web edge too: a network failure must never become a fake success.
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { code: 'COPY_TRADING_LEDGER_UNAVAILABLE', error: '카피 트레이딩은 원장 정산 검증 전까지 이용할 수 없습니다.' },
    {
      status: 503,
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow',
        'Referrer-Policy': 'no-referrer',
      },
    },
  );
}
