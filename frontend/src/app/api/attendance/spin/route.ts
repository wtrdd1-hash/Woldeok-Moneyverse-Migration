import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
import { randomUUID } from 'crypto';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  // Same-origin only (QA 2026-11-25): the BFF spends its own CSRF token, so
  // the Origin check is the only cross-site defence for this write.
  if (!isSameOriginFinanceMutation(request)) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers: { 'cache-control': 'private, no-store' } });
  }
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
