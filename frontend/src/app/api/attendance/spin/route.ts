import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();

  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ error: '로그인이 필요한 서비스입니다.' }, { status: 401 });
  }

  try {
    const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
    const idempotencyKey = randomUUID();
    const result = await api('/api/v1/engagement/dopamine/attendance/spin', {
      method: 'POST',
      csrfToken,
      body: { idempotencyKey },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '출석 룰렛 참여에 실패했습니다.' },
      { status: error?.status || 400 },
    );
  }
}
