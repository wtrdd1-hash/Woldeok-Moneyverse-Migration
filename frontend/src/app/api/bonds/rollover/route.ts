import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export async function PUT(req: Request) {
  // Same-origin only (QA 2026-11-25): the BFF spends its own CSRF token, so
  // the Origin check is the only cross-site defence for this write.
  if (!isSameOriginFinanceMutation(req)) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers: { 'cache-control': 'private, no-store' } });
  }
  try {
    const body = await req.json();
    const { holdingId, enabled } = body;
    const data = await api(`/api/v1/bonds/holdings/${holdingId}/rollover`, {
      method: 'PUT',
      body: { enabled },
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '자동 롤오버 설정 변경에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
