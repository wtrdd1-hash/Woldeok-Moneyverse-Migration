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
    const body = await request.json().catch(() => ({}));
    const csrfToken = await resolveCsrfToken(request);
    const result = await api<unknown>('/api/v1/admin/auth/channel-otp/request', {
      method: 'POST',
      body,
      ...(csrfToken ? { csrfToken } : {}),
    });
    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 400;
    const message = error instanceof Error ? error.message : 'OTP request failed';
    return NextResponse.json({ error: message, message }, { status });
  }
}
