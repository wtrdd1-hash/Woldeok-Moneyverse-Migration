import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export async function POST(request: Request) {
  // Same-origin only (QA 2026-11-25): the BFF spends its own CSRF token, so
  // the Origin check is the only cross-site defence for this write.
  if (!isSameOriginFinanceMutation(request)) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers: { 'cache-control': 'private, no-store' } });
  }
  try {
    const viewer = await viewerOrUnknown();
    if (viewer && viewer.adminRoles && viewer.adminRoles.length > 0) {
      return NextResponse.json({ recorded: 0, excluded: true });
    }

    const body = await request.json();
    const result = await api<{ recorded: number }>('/api/v1/activity/events', {
      method: 'POST',
      body,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { recorded: 0, error: 'activity_delivery_failed' },
      { status: 503, headers: { 'Retry-After': '2' } },
    );
  }
}
