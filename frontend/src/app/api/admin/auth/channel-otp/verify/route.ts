import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await api<unknown>('/api/v1/admin/auth/channel-otp/verify', {
      method: 'POST',
      body,
    });
    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 400;
    const message = error instanceof Error ? error.message : 'OTP verification failed';
    return NextResponse.json({ error: message }, { status });
  }
}
