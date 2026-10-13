import { NextResponse } from 'next/server';
import { isLoggedInMember } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const isLoggedIn = await isLoggedInMember();
    if (!isLoggedIn) {
      return NextResponse.json(
        { ok: false, message: '로그인이 필요한 서비스입니다.' },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      businessName?: string;
      requestedAmountWld?: number;
      businessPlan?: string;
    };

    const businessName = body.businessName?.trim();
    const requestedAmountWld = body.requestedAmountWld || 0;
    const businessPlan = body.businessPlan?.trim();

    if (!businessName || businessName.length < 2) {
      return NextResponse.json(
        { ok: false, message: '기업/프로젝트명은 최소 2자 이상 입력해주세요.' },
        { status: 400 }
      );
    }

    if (requestedAmountWld <= 0 || requestedAmountWld > 100000) {
      return NextResponse.json(
        { ok: false, message: '신청 지원금은 1 WLD 이상 100,000 WLD 이하여야 합니다.' },
        { status: 400 }
      );
    }

    if (!businessPlan || businessPlan.length < 10) {
      return NextResponse.json(
        { ok: false, message: '사업 기획서 및 지원 사유는 10자 이상 구체적으로 작성해주세요.' },
        { status: 400 }
      );
    }

    const applicationId = `GRANT-${Date.now().toString(36).toUpperCase()}`;

    return NextResponse.json({
      ok: true,
      message: `창업 그랜트 지원금 신청서가 성공적으로 접수되었습니다. (접수번호: ${applicationId}) 관리자 심사 후 지급됩니다.`,
      applicationId,
      businessName,
      requestedAmountWld,
      status: 'PENDING_REVIEW',
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
