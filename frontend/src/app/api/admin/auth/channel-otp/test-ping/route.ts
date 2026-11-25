import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export const dynamic = 'force-dynamic';

async function resolveCsrfToken(req: Request): Promise<string | undefined> {
  const headerToken = req.headers.get('x-csrf-token');
  if (headerToken) return headerToken;
  try {
    const session = await api<{ csrfToken?: string }>('/api/v1/auth/session');
    return session.csrfToken;
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  // Same-origin only (QA 2026-11-25): the BFF spends its own CSRF token, so
  // the Origin check is the only cross-site defence for this write.
  if (!isSameOriginFinanceMutation(request)) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers: { 'cache-control': 'private, no-store' } });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const csrfToken = await resolveCsrfToken(request);
    const result = await api<{ ok: boolean; success: boolean; dispatchedTo: string[] }>(
      '/api/v1/admin/auth/channel-otp/test-ping',
      {
        method: 'POST',
        body,
        ...(csrfToken ? { csrfToken } : {}),
      },
    );
    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 400;
    const message = error instanceof Error ? error.message : 'Test ping failed';
    return NextResponse.json({ error: message, message }, { status });
  }
}
