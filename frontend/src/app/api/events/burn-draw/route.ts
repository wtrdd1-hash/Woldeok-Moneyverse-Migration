import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const data = await api('/api/v1/economy/events/burn-draw/stats');
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '소각 이벤트 통계 조회 실패' },
      { status: error?.status || 500 }
    );
  }
}

export async function POST(_request: Request): Promise<NextResponse> {
  const headers = {
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex',
    'Referrer-Policy': 'no-referrer',
  };
  const viewer = await viewerOrUnknown();
  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ error: '로그인이 필요한 서비스입니다.' }, { status: 401, headers });
  }
  // Never forward a WLD debit to migration 263's noncanonical burn function.
  return NextResponse.json({
    code: 'BURN_DRAW_LEDGER_UNAVAILABLE',
    error: '원장 정산과 중복 실행 방지가 검증될 때까지 소각 드로우 참여가 중단되었습니다.',
  }, { status: 503, headers });
}
