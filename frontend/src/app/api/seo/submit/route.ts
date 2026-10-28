import { type NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { parseIndexNowSubmissionReceipt } from '@/app/admin/seo/seo-submit-evidence';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}));
    const data = await mutate<unknown>('/api/v1/seo/submit', {
      method: 'POST',
      body,
      timeoutMs: 20_000,
    });
    const evidence = parseIndexNowSubmissionReceipt(data, process.env.APP_BASE_URL ?? 'https://easy-scraping.com');
    if (!evidence) {
      return NextResponse.json(
        { success: false, message: '검색엔진 접수 응답을 검증하지 못했습니다. 중복 제출 전에 관리자 기록을 확인하세요.' },
        { status: 503, headers: { 'cache-control': 'private, no-store' } },
      );
    }
    return NextResponse.json(evidence.success ? evidence : {
      ...evidence, message: '검색엔진에서 URL 변경 알림을 접수한 곳이 없습니다.',
    }, {
      status: evidence.success ? 200 : 502,
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
