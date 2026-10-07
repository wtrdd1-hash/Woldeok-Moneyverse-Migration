import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const data = await api('/api/v1/admin/treasury/swf/liquidate', {
      method: 'POST',
      body,
    });
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status });
  }
}
