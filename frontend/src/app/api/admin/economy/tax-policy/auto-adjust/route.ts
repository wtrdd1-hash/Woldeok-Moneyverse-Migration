import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  // Same-origin only (QA 2026-11-25): the BFF spends its own CSRF token, so
  // the Origin check is the only cross-site defence for this write.
  if (!isSameOriginFinanceMutation(request)) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers: { 'cache-control': 'private, no-store' } });
  }
  try {
    const res = await api<unknown>('/api/v1/admin/economy/tax-policy/auto-adjust', {
      method: 'POST',
    });
    return NextResponse.json(res, { headers: noStore });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: 'Failed to auto-adjust tax policies' },
      { status, headers: noStore },
    );
  }
}
