import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ error: '로그인이 필요한 서비스입니다.' }, { status: 401 });
  }

  try {
    const result = await api<Record<string, unknown>>('/api/v1/stocks/league/join', {
      method: 'POST',
      body: {},
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '리그 참가 신청에 실패했습니다.' },
      { status: error?.status || 400 },
    );
  }
}
