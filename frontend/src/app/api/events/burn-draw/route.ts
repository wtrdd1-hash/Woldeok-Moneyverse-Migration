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

export async function POST(request: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ error: '로그인이 필요한 서비스입니다.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data = await api('/api/v1/economy/events/burn-draw/participate', {
      method: 'POST',
      body,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '소각 참여에 실패했습니다.' },
      { status: error?.status || 400 }
    );
  }
}
