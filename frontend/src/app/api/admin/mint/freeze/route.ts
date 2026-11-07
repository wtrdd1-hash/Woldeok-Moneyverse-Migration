import { type NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const endpoint = body.freeze ? '/api/v1/admin/economy/monetary/freeze' : '/api/v1/admin/economy/monetary/unfreeze';
    const payload = body.freeze ? { reason: body.reason || '관리자 관제탑 수동 긴급 동결' } : {};
    const result = await api<unknown>(endpoint, {
      method: 'POST',
      body: payload,
    });
    return NextResponse.json(result, { headers });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    const message = e instanceof ApiError ? e.message : '통화 발행 동결/해제 변경에 실패했습니다.';
    return NextResponse.json({ error: message }, { status, headers });
  }
}
