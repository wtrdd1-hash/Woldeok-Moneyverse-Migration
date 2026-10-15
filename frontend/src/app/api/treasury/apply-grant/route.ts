import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Never acknowledge a new grant application until applicant identity,
// canonical database persistence and audit trails are implemented.
export async function POST(_request: Request) {
  return NextResponse.json(
    { ok: false, message: '창업 지원금 신청은 본인 확인 및 DB 원자 기록 기능 검증 전까지 일시 중단되었습니다.' },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
