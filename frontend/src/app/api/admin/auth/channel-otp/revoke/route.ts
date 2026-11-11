import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await mutate<{ ok: boolean; revoked: boolean }>(
      '/api/admin/auth/channel-otp/revoke',
      {
        method: 'POST',
      },
    );

    const response = NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    });

    response.cookies.delete('admin_r2_elevated');
    return response;
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Revoke failed';
    return NextResponse.json({ error: message }, { status });
  }
}
