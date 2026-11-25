import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import { api, ApiError } from '@/lib/api';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Same-origin only (QA 2026-11-25): the BFF spends its own CSRF token, so
  // the Origin check is the only cross-site defence for this write.
  if (!isSameOriginFinanceMutation(req)) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers: { 'cache-control': 'private, no-store' } });
  }
  try {
    // R14 보안 가드: 관리자 세션 검증
    const viewer = await currentViewer();
    if (!isAdministrator(viewer)) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // 관리자 세션에서 유효한 CSRF 토큰 획득
    let csrfToken: string | undefined = req.headers.get('x-csrf-token') || undefined;
    if (!csrfToken) {
      try {
        const session = await api<{ csrfToken?: string }>('/api/v1/auth/session');
        csrfToken = session.csrfToken;
      } catch {
        // Fallback swallow
      }
    }

    // 표준 api()를 통해 x-internal-token, 쿠키, CSRF 토큰을 안전하게 주입
    const data = await api<Record<string, unknown>>('/api/v1/admin/discord/test-dm', {
      method: 'POST',
      body,
      ...(csrfToken ? { csrfToken } : {}),
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          error: error.detail || error.message,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
