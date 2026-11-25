import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const result = await api<Record<string, unknown>>('/api/v1/arena/rooms', {
      method: 'GET',
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '대결방 목록을 불러오지 못했습니다.' },
      { status: error?.status || 400 },
    );
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  // Same-origin only (QA 2026-11-25): the BFF spends its own CSRF token, so
  // the Origin check is the only cross-site defence for this write.
  if (!isSameOriginFinanceMutation(req)) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers: { 'cache-control': 'private, no-store' } });
  }
  const viewer = await viewerOrUnknown();
  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ error: '로그인이 필요한 서비스입니다.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { gameType, stakeAmount, creatorMove } = body;

    if (!gameType || !stakeAmount) {
      return NextResponse.json({ error: '게임 종목과 베팅 금액을 입력해주세요.' }, { status: 400 });
    }

    const result = await api<Record<string, unknown>>('/api/v1/arena/rooms', {
      method: 'POST',
      body: {
        gameType,
        stakeAmount: Number(stakeAmount),
        creatorMove,
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '대결방 생성에 실패했습니다.' },
      { status: error?.status || 400 },
    );
  }
}
