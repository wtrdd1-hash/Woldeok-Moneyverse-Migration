import { type NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';

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
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: '정책 발의 요청 형식이 올바르지 않습니다.' }, { status: 400, headers });
    }
    const mintEnvelopes = new Set([
      'WORK_REWARD', 'QUEST_REWARD', 'EVENT_REWARD', 'INCIDENT_COMPENSATION',
      'STABILIZATION_POOL', 'GENERAL_CIRCULATION', 'TREASURY_ISSUANCE',
    ]);
    const validPolicy = (body.order_type === 'MINT' && mintEnvelopes.has(body.target_envelope))
      || (body.order_type === 'RETIRE' && body.target_envelope === 'HARD_SINK_PURGE');
    if (!validPolicy) {
      return NextResponse.json({
        error: '현재 정책 명령 유형/대상 조합을 지원하지 않습니다.',
        code: 'UNSUPPORTED_MONETARY_POLICY',
      }, { status: 422, headers });
    }
    if (typeof body.max_amount_wld !== 'string' || !/^[0-9]+$/.test(body.max_amount_wld)
      || BigInt(body.max_amount_wld) <= 0n || typeof body.reason !== 'string'
      || body.reason.trim().length < 10 || !Number.isInteger(body.valid_duration_hours)
      || body.valid_duration_hours < 1 || body.valid_duration_hours > 720) {
      return NextResponse.json({ error: '수량·감사 사유·유효 기간을 다시 확인해 주세요.' }, { status: 422, headers });
    }
    const result = await mutate<unknown>('/api/v1/admin/economy/monetary/orders/propose', {
      method: 'POST',
      body,
    });
    return NextResponse.json(result, { headers });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    const message = status >= 500
      ? '정책 명령 발의 처리가 실패했습니다. 관리자 로그에서 원인을 확인해 주세요.'
      : e instanceof ApiError ? e.message : '통화정책 명령서 발의에 실패했습니다.';
    return NextResponse.json({ error: message }, { status, headers });
  }
}
