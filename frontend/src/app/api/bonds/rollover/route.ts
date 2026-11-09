import { NextResponse } from 'next/server';
import { mutate } from '@/lib/mutate';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

const responseHeaders = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' };

export async function PUT(req: Request) {
  if (!isSameOriginFinanceMutation(req)) {
    return NextResponse.json({ error: '요청 출처를 확인할 수 없습니다.' }, { status: 403, headers: responseHeaders });
  }
  try {
    const body = await req.json();
    const { holdingId, enabled } = body;
    const data = await mutate(`/api/v1/bonds/holdings/${holdingId}/rollover`, {
      method: 'PUT',
      body: { enabled },
    });
    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '자동 롤오버 설정 변경에 실패했습니다.' },
      { status: error?.status || 500, headers: responseHeaders },
    );
  }
}
