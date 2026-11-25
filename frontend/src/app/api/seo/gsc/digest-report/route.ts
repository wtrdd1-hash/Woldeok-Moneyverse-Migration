import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export const dynamic = 'force-dynamic';

const privateHeaders = { 'cache-control': 'private, no-store' };

function failure(error: unknown): NextResponse {
  const status = error instanceof ApiError ? error.status : 503;
  return NextResponse.json(
    {
      error:
        'SEO daily digest was not dispatched. Verify administrator session and backend availability.',
    },
    { status, headers: privateHeaders },
  );
}

export async function GET(): Promise<NextResponse> {
  try {
    const data = await api('/api/v1/seo/gsc/digest-report');
    return NextResponse.json(data, { headers: privateHeaders });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  // Same-origin only (QA 2026-11-25): the BFF spends its own CSRF token, so
  // the Origin check is the only cross-site defence for this write.
  if (!isSameOriginFinanceMutation(request)) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers: { 'cache-control': 'private, no-store' } });
  }
  try {
    const data = await mutate('/api/v1/seo/gsc/digest-report', {
      method: 'POST',
      body: {},
      timeoutMs: 60_000,
    });
    return NextResponse.json(data, { headers: privateHeaders });
  } catch (error) {
    return failure(error);
  }
}
