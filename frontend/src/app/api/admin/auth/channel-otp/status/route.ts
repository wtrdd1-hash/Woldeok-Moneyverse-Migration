import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { get } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await get<{ ok: boolean; elevated: boolean; remainingSeconds: number; expiresAt: number }>(
      '/api/admin/auth/channel-otp/status',
    );
    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Status check failed';
    return NextResponse.json({ error: message }, { status });
  }
}
