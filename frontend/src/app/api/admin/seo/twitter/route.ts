import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await api('/api/v1/seo/twitter/status');
    return NextResponse.json(data, {
      headers: { 'cache-control': 'private, no-store' },
    });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 503;
    return NextResponse.json(
      { configured: false, hasApiKey: false, hasAccessToken: false, error: 'SERVICE_UNAVAILABLE' },
      { status, headers: { 'cache-control': 'private, no-store' } },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string };
    const result = await mutate('/api/v1/seo/twitter/test-tweet', {
      method: 'POST',
      body: { text: body.text },
      timeoutMs: 15_000,
    });
    return NextResponse.json(result, {
      headers: { 'cache-control': 'private, no-store' },
    });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof ApiError ? err.detail : '트윗 발행 요청 실패';
    return NextResponse.json(
      { success: false, error: message },
      { status, headers: { 'cache-control': 'private, no-store' } },
    );
  }
}
