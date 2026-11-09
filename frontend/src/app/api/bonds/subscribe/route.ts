import { NextResponse } from 'next/server';
import { mutate } from '@/lib/mutate';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

const responseHeaders = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' };

export async function POST(req: Request) {
  if (!isSameOriginFinanceMutation(req)) {
    return NextResponse.json({ error: '요청 출처를 확인할 수 없습니다.' }, { status: 403, headers: responseHeaders });
  }
  try {
    const body = await req.json();
    const data = await mutate('/api/v1/bonds/subscribe', {
      method: 'POST',
      body,
    });
    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '국채 청약 신청에 실패했습니다.' },
      { status: error?.status || 500, headers: responseHeaders },
    );
  }
}
