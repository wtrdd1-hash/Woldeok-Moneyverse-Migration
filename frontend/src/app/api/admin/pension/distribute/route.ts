import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await api<Record<string, unknown>>('/api/v1/admin/pension/distribute-payouts', {
      method: 'POST',
    });
    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof ApiError ? error.message : '연금 일괄 지급 처리에 실패했습니다.';
    return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
