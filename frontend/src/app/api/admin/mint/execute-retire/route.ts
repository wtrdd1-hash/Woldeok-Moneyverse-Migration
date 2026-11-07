import { type NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await api<unknown>('/api/v1/admin/economy/monetary/execute-retire', {
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
