import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const canonical = process.env.APP_BASE_URL
    ? new URL(process.env.APP_BASE_URL).origin
    : new URL(request.url).origin;
  if (origin && origin !== canonical) {
    return NextResponse.json({ ok: false, message: '요청 출처가 허용되지 않았습니다.' }, {
      status: 403, headers: noStore,
    });
  }

  try {
    const body = await request.json();
    const { applicantName, businessName, businessPlan, category, tier } = body ?? {};

    if (!businessName || !businessPlan) {
      return NextResponse.json(
        { ok: false, message: '사업체 명칭과 사업계획서 내용은 필수 입력 항목입니다.' },
        { status: 400, headers: noStore },
      );
    }

    const res = await mutate<{ ok: boolean; message: string; result: unknown }>(
      '/api/v1/treasury/grants/apply',
      {
        method: 'POST',
        body: { applicantName, businessName, businessPlan, category, tier },
      },
    );

    return NextResponse.json(res, { headers: noStore });
  } catch (err: unknown) {
    const status = err instanceof ApiError ? err.status : 500;
    const msg = err instanceof Error ? err.message : '창업 지원금 신청 처리 중 오류가 발생했습니다.';
    return NextResponse.json({ ok: false, message: msg }, { status, headers: noStore });
  }
}

