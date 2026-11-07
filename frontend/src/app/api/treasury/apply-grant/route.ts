import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicantName, businessName, businessPlan, category, tier } = body;

    if (!businessName || !businessPlan) {
      return NextResponse.json(
        { ok: false, message: '사업체 명칭과 사업계획서 내용은 필수 입력 항목입니다.' },
        { status: 400, headers: noStore },
      );
    }

    const res = await api<{ ok: boolean; message: string; result: any }>(
      '/api/v1/treasury/grants/apply',
      {
        method: 'POST',
        body: JSON.stringify({ applicantName, businessName, businessPlan, category, tier }),
      },
    );

    return NextResponse.json(res, { headers: noStore });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '창업 지원금 신청 처리 중 오류가 발생했습니다.';
    return NextResponse.json({ ok: false, message: msg }, { status: 500, headers: noStore });
  }
}
