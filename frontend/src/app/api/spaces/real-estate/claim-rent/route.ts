import { NextResponse } from 'next/server';

/** No verified PostgreSQL/ledger settlement exists for the legacy auction. */
export async function POST() {
  return NextResponse.json(
    { ok: false, error: '월세 배당금 수령은 검증된 원장 영수증이 준비될 때까지 중단됩니다.' },
    { status: 503, headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' } },
  );
}
