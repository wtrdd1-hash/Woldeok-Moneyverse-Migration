import { type NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await api<unknown>('/api/v1/admin/bonds/issues', {
      method: 'POST',
      body,
    });
    return NextResponse.json(result, { headers });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    const message = e instanceof ApiError ? e.message : '신규 국채 종목 발행에 실패했습니다.';
    return NextResponse.json({ error: message }, { status, headers });
  }
}
