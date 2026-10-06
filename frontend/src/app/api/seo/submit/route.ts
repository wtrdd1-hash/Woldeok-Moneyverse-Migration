import { type NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}));
    const data = await mutate('/api/v1/seo/submit', {
      method: 'POST',
      body,
      timeoutMs: 20_000,
    });
    return NextResponse.json(data, {
      headers: { 'cache-control': 'private, no-store' },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    const message =
      error instanceof ApiError && error.detail
        ? error.detail
        : '검색엔진 URL 변경 통보에 실패했습니다.';
    return NextResponse.json(
      { success: false, message },
      { status, headers: { 'cache-control': 'private, no-store' } },
    );
  }
}
