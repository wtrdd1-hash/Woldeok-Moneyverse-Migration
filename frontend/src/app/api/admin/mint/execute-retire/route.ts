import { type NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const reqUrl = req.url || "http://localhost";
  const canonical = process.env.APP_BASE_URL
    ? new URL(process.env.APP_BASE_URL).origin
    : new URL(reqUrl).origin;
  if (origin && origin !== canonical) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers });
  }

  try {
    const body = await req.json();
    const result = await mutate<unknown>('/api/v1/admin/economy/monetary/execute-retire', {
      method: 'POST',
      body,
    });
    return NextResponse.json(result, { headers });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    const message = e instanceof ApiError ? e.message : '통화 영구 소각 실행에 실패했습니다.';
    return NextResponse.json({ error: message }, { status, headers });
  }
}
