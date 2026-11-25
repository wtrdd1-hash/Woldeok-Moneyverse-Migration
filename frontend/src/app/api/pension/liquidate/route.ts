import { NextResponse } from 'next/server';
import { mutate } from '@/lib/mutate';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export const dynamic = 'force-dynamic';

const privateHeaders = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' };

export async function POST(req: Request) {
  // Shared same-origin guard (QA 2026-11-25): the hand-rolled check here either
  // failed open without an Origin or refused every proxied browser request.
  if (!isSameOriginFinanceMutation(req)) {
    return NextResponse.json({ error: 'Forbidden request' }, { status: 403, headers: privateHeaders });
  }

  try {
    const data = await mutate('/api/v1/pension/liquidate', { method: 'POST' });
    return NextResponse.json(data, { headers: privateHeaders });
  } catch (error: unknown) {
    const failure = error as { message?: string; status?: number } | null;
    return NextResponse.json(
      { error: failure?.message || '국민연금 중도 해지에 실패했습니다.' },
      { status: failure?.status || 500, headers: privateHeaders },
    );
  }
}
