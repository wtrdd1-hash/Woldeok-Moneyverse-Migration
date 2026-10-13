import { NextResponse } from 'next/server';
import { isLoggedInMember } from '@/lib/session';
import type { TreasuryGrantApplication } from '@/app/treasury/treasury.types';

export const dynamic = 'force-dynamic';

const INITIAL_APPLICATIONS: TreasuryGrantApplication[] = [
  {
    id: 'GRANT-2026-001',
    businessName: '머니버스 AMM 덱스 (월덕스왑)',
    applicantId: 'usr-9281',
    applicantMasked: 'defi***developer',
    requestedAmountWld: 50000,
    businessPlan: '슬리피지 0.05% 이하의 수학적 오토메이티드 마켓 메이킹 풀을 구축하여 유저 간 즉시 토큰 교환 인프라를 제공하겠습니다.',
    status: 'PENDING_REVIEW',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'GRANT-2026-002',
    businessName: '네오서울 메가물류 물류센터',
    applicantId: 'usr-1102',
    applicantMasked: 'logis***master',
    requestedAmountWld: 80000,
    businessPlan: '도시 부지 공간에 대형 물류 허브를 건립하여 플레이어 직업 아이템 배송 시간을 50% 단축하고 물류 수수료 수입을 창출합니다.',
    status: 'PENDING_REVIEW',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'GRANT-2026-003',
    businessName: '덕비트 AI 퀀트 리서치',
    applicantId: 'usr-4419',
    applicantMasked: 'quant***wizard',
    requestedAmountWld: 30000,
    businessPlan: '고빈도 알고리즘 봇을 오픈소스로 공개하여 가상 주식 시장의 가격 왜곡을 축소하고 개미 투자자에게 실시간 분석 차트를 제공합니다.',
    status: 'APPROVED',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    reviewNote: '국고 30,000 WLD 지급 집행 완료 (승인: 오퍼레이터)',
  },
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    applications: INITIAL_APPLICATIONS,
  });
}

export async function POST(request: Request) {
  try {
    const isLoggedIn = await isLoggedInMember();
    if (!isLoggedIn) {
      return NextResponse.json(
        { ok: false, message: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      applicationId?: string;
      action?: 'APPROVE' | 'REJECT';
      reviewNote?: string;
    };

    if (!body.applicationId || !body.action) {
      return NextResponse.json(
        { ok: false, message: '신청서 ID 및 심사 액션이 필요합니다.' },
        { status: 400 }
      );
    }

    const isApprove = body.action === 'APPROVE';
    const status = isApprove ? 'APPROVED' : 'REJECTED';
    const note = body.reviewNote || (isApprove ? '관리자 심사 통과: 국고 시드머니 원자적 출금 완료' : '사업 계획 보완 필요로 반려 처리');

    return NextResponse.json({
      ok: true,
      message: `창업 그랜트 신청서 [${body.applicationId}]가 ${isApprove ? '최종 승인 및 국고 지급' : '반려'} 처리되었습니다.`,
      applicationId: body.applicationId,
      status,
      reviewNote: note,
      reviewedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
