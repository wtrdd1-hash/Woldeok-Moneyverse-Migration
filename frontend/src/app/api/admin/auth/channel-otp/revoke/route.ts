import { NextResponse } from 'next/server';
import { mutate } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await mutate<{ ok: boolean; revoked: boolean }>(
      '/api/v1/admin/auth/channel-otp/revoke',
      {
        method: 'POST',
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
    const message = error instanceof Error ? error.message : 'Revocation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
