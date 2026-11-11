import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

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
  try {
    const csrfToken = await resolveCsrfToken(request);
    const result = await api<{ ok: boolean; revoked: boolean }>(
      '/api/v1/admin/auth/channel-otp/revoke',
      {
        method: 'POST',
        ...(csrfToken ? { csrfToken } : {}),
      },
    );

    const response = NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    });

    // R2 세션 승격 쿠키 삭제
    response.cookies.delete('admin_r2_elevated');
    return response;
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 400;
    const message = error instanceof Error ? error.message : 'Revocation failed';
    return NextResponse.json({ error: message, message }, { status });
  }
}
