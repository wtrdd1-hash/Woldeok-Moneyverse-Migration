import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

const privateHeaders = { 'cache-control': 'private, no-store' };

function failure(error: unknown): NextResponse {
  const status = error instanceof ApiError ? error.status : 503;
  return NextResponse.json(
    { error: 'SEO crawl audit is unavailable; no audit result was produced.' },
    { status, headers: privateHeaders },
  );
}

export async function GET(): Promise<NextResponse> {
  try {
    const data = await api('/api/v1/seo/crawl-audit', { timeoutMs: 20_000 });
    return NextResponse.json(data, { headers: privateHeaders });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(): Promise<NextResponse> {
  try {
    const data = await mutate('/api/v1/seo/crawl-audit', {
      method: 'POST',
      body: {},
      timeoutMs: 60_000,
    });
    return NextResponse.json(data, { headers: privateHeaders });
  } catch (error) {
    return failure(error);
  }
}
