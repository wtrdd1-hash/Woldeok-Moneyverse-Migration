import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await mutate<{ ok: boolean; elevated: boolean; expiresAt: number }>(
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
      // 15ë¶?R2 ?¹ê²© ì¿ í‚¤ ?¤ì •
      response.cookies.set('admin_r2_elevated', 'true', {
        path: '/',
        maxAge: 15 * 60,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return response;
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'R2 elevation failed';
    return NextResponse.json({ error: message }, { status });
  }
}
