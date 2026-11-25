import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  // Same-origin only (QA 2026-11-25): the BFF spends its own CSRF token, so
  // the Origin check is the only cross-site defence for this write.
  if (!isSameOriginFinanceMutation(request)) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers: { 'cache-control': 'private, no-store' } });
  }
  try {
    const viewer = await currentViewer();
    if (!isAdministrator(viewer)) {
      return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 });
    }
    const payload = await request.json().catch(() => ({}));
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return NextResponse.json({ error: 'INVALID_POLICY_PAYLOAD' }, { status: 400 });
    }
    const { kind, value, rationale, inflationTarget } = payload as Record<string, unknown>;
    if (kind !== 'base-rate' && kind !== 'reserve-requirement') {
      return NextResponse.json({ error: 'INVALID_POLICY_TYPE' }, { status: 400 });
    }
    if (typeof value !== 'string' || typeof rationale !== 'string') {
      return NextResponse.json({ error: 'INVALID_POLICY_PAYLOAD' }, { status: 400 });
    }
    const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
    if (!csrfToken) return NextResponse.json({ error: 'CSRF_REQUIRED' }, { status: 403 });
    const data = await api(
      kind === 'base-rate' ? '/api/v1/central-bank/base-rate' : '/api/v1/central-bank/reserve-requirement',
      {
        method: 'PUT',
        csrfToken,
        body: kind === 'base-rate'
          ? { baseRatePercent: value, rateDecisionRationale: rationale, targetInflationPercent: inflationTarget }
          : { reserveRatioPercent: value, regulationRationale: rationale },
      },
    );
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof ApiError ? error.detail ?? error.code ?? 'POLICY_UPDATE_FAILED' : 'POLICY_UPDATE_FAILED' },
      { status: error instanceof ApiError ? error.status : 503 },
    );
  }
}
