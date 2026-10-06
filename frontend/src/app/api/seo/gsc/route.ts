import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

function failure(error: unknown, fallback: string): NextResponse {
  const status = error instanceof ApiError ? error.status : 503;
  const message =
    error instanceof ApiError && error.detail
      ? error.detail
      : fallback;
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { 'cache-control': 'private, no-store' },
    },
  );
}

export async function GET() {
  try {
    const data = await api('/api/v1/seo/gsc/analytics');
    return NextResponse.json(data, {
      headers: { 'cache-control': 'private, no-store' },
    });
  } catch (error) {
    return failure(error, 'Google Search Console 데이터를 불러오지 못했습니다.');
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { readonly action?: unknown; readonly keyJson?: unknown };

    if (body.action === 'delete') {
      const result = await mutate('/api/v1/seo/gsc/credentials/delete', {
        method: 'POST',
        body: {},
      });
      return NextResponse.json(result, {
        headers: { 'cache-control': 'private, no-store' },
      });
    }

    if (body.action === 'submit-sitemap') {
      const result = await mutate('/api/v1/seo/gsc/sitemap', {
        method: 'POST',
        body: {},
        timeoutMs: 20_000,
      });
      return NextResponse.json(result, {
        headers: { 'cache-control': 'private, no-store' },
      });
    }

    if (typeof body.keyJson !== 'string' || !body.keyJson.trim()) {
      return NextResponse.json(
        { success: false, message: '서비스 계정 JSON 키를 입력해 주세요.' },
        { status: 400, headers: { 'cache-control': 'private, no-store' } },
      );
    }

    const result = await mutate('/api/v1/seo/gsc/credentials', {
      method: 'POST',
      body: { keyJson: body.keyJson },
      timeoutMs: 20_000,
    });
    return NextResponse.json(result, {
      headers: { 'cache-control': 'private, no-store' },
    });
  } catch (error) {
    return failure(error, 'Google Search Console 서비스 계정 처리에 실패했습니다.');
  }
}
