import { NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function GET() {
  try {
    const orders = await api<unknown[]>('/api/v1/admin/economy/monetary/orders?limit=50');
    return NextResponse.json({
      orders: Array.isArray(orders) ? orders : [],
    }, { headers });
  } catch (e) {
    const denied = e instanceof ApiError && (e.status === 401 || e.status === 403);
    return NextResponse.json({
      error: '통화정책 명령서 조회에 실패했습니다.',
      code: denied ? (e.status === 401 ? 'AUTHENTICATION_REQUIRED' : 'AUTHORIZATION_DENIED') : 'ORDERS_UNAVAILABLE',
    }, { status: denied ? e.status : 503, headers });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await api<unknown>('/api/v1/admin/economy/monetary/orders/propose', {
      method: 'POST',
      body,
    });
    return NextResponse.json(result, { headers });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    const message = e instanceof ApiError ? e.message : '통화정책 명령서 발의에 실패했습니다.';
    return NextResponse.json({ error: message }, { status, headers });
  }
}
