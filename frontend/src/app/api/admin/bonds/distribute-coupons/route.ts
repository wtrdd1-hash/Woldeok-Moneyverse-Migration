import { NextResponse } from 'next/server';

// P0 containment: this legacy proxy must not initiate unposted WLD payouts.
export async function POST() {
  return NextResponse.json(
    { code: 'bond_ledger_settlement_unavailable', error: '국채 쿠폰 정산은 금융 원장 검증 완료 전까지 중지되었습니다.' },
    { status: 503, headers: { 'cache-control': 'private, no-store' } },
  );
}
