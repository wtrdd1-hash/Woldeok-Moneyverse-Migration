import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await api<{ ok: boolean; elevated: boolean; expiresAt: number }>(
      '/api/v1/admin/auth/channel-otp/elevate',
      {
        method: 'POST',
        body,
      },
    );

    const response = NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    });

    if (result?.elevated) {
      // 15분 R2 세션 승격 쿠키 설정
      response.cookies.set('admin_r2_elevated', 'true', {
        path: '/',
        maxAge: 15 * 60,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return response;
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 400;
    const message = error instanceof Error ? error.message : 'Elevation failed';
    return NextResponse.json({ error: message }, { status });
  }
}
