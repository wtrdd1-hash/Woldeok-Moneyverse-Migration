import { NextResponse } from 'next/server';

// The legacy write does not provide a DB-owned mutation receipt or least-privilege boundary.
export async function PUT() {
  return NextResponse.json(
    {
      code: 'SOE_STATUS_MUTATION_UNVERIFIED',
      error: '공기업 상태 변경은 검증 전까지 중지되었습니다.',
    },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
