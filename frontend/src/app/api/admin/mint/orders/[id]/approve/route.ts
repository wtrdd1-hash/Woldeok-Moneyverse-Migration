import { type NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const origin = req.headers.get('origin');
  const reqUrl = req.url || 'http://localhost';
  const canonical = process.env.APP_BASE_URL
    ? new URL(process.env.APP_BASE_URL).origin
    : new URL(reqUrl).origin;
  if (origin && origin !== canonical) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: '명령서 ID가 누락되었습니다.' }, { status: 400, headers });
  }

  try {
    const result = await mutate<unknown>(`/api/v1/admin/economy/monetary/orders/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
      body: {},
    });
    return NextResponse.json(result, { headers });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    const message = e instanceof ApiError ? e.message : '통화정책 명령서 승인에 실패했습니다.';
    return NextResponse.json({ error: message }, { status, headers });
  }
}
