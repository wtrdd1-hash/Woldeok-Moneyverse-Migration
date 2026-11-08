import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function POST() {
  try {
    const result = await api<unknown>('/api/v1/admin/bonds/distribute-coupons', {
      method: 'POST',
    });
    return NextResponse.json(result, { headers });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    const message = e instanceof ApiError ? e.message : '국채 쿠폰 이자 정산 집행에 실패했습니다.';
    return NextResponse.json({ error: message }, { status, headers });
  }
}
