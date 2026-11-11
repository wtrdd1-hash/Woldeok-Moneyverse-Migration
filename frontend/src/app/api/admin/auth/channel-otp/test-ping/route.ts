import { NextResponse } from 'next/server';
import { mutate } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await mutate<{ ok: boolean; success: boolean; dispatchedTo: string[] }>(
      '/api/v1/admin/auth/channel-otp/test-ping',
      {
        method: 'POST',
        body,
      },
    );
    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Test ping failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
