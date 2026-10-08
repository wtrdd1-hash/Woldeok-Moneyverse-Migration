import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ error: '로그인이 필요한 서비스입니다.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { whaleId, whaleName, allocatedBudget, copyRatio } = body;

    if (!whaleId || !allocatedBudget) {
      return NextResponse.json({ error: '고래 트레이더 ID와 할당 자본금을 입력해주세요.' }, { status: 400 });
    }

    const result = await api<Record<string, unknown>>('/api/v1/stocks/league/copy-trade/subscribe', {
      method: 'POST',
      body: {
        whaleId,
        whaleName,
        allocatedBudget: Number(allocatedBudget),
        copyRatio: copyRatio ? Number(copyRatio) : 1.0,
      },
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '카피 트레이딩 구독에 실패했습니다.' },
      { status: error?.status || 400 },
    );
  }
}
