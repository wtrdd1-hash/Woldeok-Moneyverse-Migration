import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ error: '로그인이 필요한 서비스입니다.' }, { status: 401 });
  }

  const { id: roomId } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const { opponentMove } = body;

    const result = await api<Record<string, unknown>>(`/api/v1/arena/rooms/${roomId}/join`, {
      method: 'POST',
      body: {
        opponentMove,
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '대결 참가 및 실행에 실패했습니다.' },
      { status: error?.status || 400 },
    );
  }
}
