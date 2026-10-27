import { NextResponse } from 'next/server';

// Manual bond settlement is not certified as ledger-backed or idempotent.
// Keep the web gateway closed even if a caller bypasses the disabled UI.
export async function POST() {
  return NextResponse.json(
    { error: '국채 수동 이자 지급은 원장 검증 완료 전까지 보류됩니다.' },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
