import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// A client must not mutate a subscription until the backend can prove
// ledger-backed execution and return an authenticated durable receipt.
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: '카피 트레이딩 거래 기능은 원장 검증 전까지 일시 중단되었습니다.' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
