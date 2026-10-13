import { NextResponse } from 'next/server';
import { isLoggedInMember } from '@/lib/session';
import type { TreasuryDaoProposal } from '@/app/treasury/treasury.types';

export const dynamic = 'force-dynamic';

// 인메모리 기본 주민참여예산 제안 목록
const DEFAULT_PROPOSALS: TreasuryDaoProposal[] = [
  {
    id: 'prop-101',
    title: '월덕거래소 주식 매매 수수료 전액 국고 대납 지원 (1주간)',
    category: 'FEE_CUT',
    categoryLabel: '수수료 감면',
    requestedBudgetWld: 250000,
    proposerMasked: 'trader***77',
    description: '주식 거래 활성화 및 신규 투자자 유치를 위해 7일간 발생하는 모든 주식 거래 수수료를 국고에서 지원합니다.',
    votesCount: 842,
    targetVotes: 1000,
    status: 'VOTING',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'prop-102',
    title: '신규 창업 클럽·협동조합 공공 인프라 부스트 펀딩',
    category: 'COMMUNITY_FUND',
    categoryLabel: '길드 지원',
    requestedBudgetWld: 500000,
    proposerMasked: 'guild***01',
    description: '신규 설립된 소셜 클럽 및 협동조합에게 활동 본부 구축 및 공동 기금 매칭 펀드를 국고에서 1:1 지원합니다.',
    votesCount: 1120,
    targetVotes: 1000,
    status: 'PASSED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
  },
  {
    id: 'prop-103',
    title: '저유동성 성장주 국고 자동 시장조성자(AMM) 유동성 공급',
    category: 'MARKET_MAKING',
    categoryLabel: '시장 조성',
    requestedBudgetWld: 1000000,
    proposerMasked: 'quant***89',
    description: '호가 공백으로 매매가 어려운 혁신 중소형 종목들에 대해 국고 재정으로 양방향 매수/매도 유동성을 안전하게 제공합니다.',
    votesCount: 654,
    targetVotes: 1000,
    status: 'VOTING',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    proposals: DEFAULT_PROPOSALS,
  });
}

export async function POST(request: Request) {
  try {
    const isLoggedIn = await isLoggedInMember();
    if (!isLoggedIn) {
      return NextResponse.json(
        { ok: false, message: '주민참여예산 제안은 로그인 후 가능합니다.' },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
      category?: 'FEE_CUT' | 'COMMUNITY_FUND' | 'MARKET_MAKING' | 'PUBLIC_EVENT';
      requestedBudgetWld?: number;
      description?: string;
    };

    const title = body.title?.trim();
    const budget = body.requestedBudgetWld || 0;
    const desc = body.description?.trim();

    if (!title || title.length < 5) {
      return NextResponse.json(
        { ok: false, message: '제안 제목은 최소 5자 이상 작성해주세요.' },
        { status: 400 }
      );
    }

    if (budget <= 0 || budget > 2000000) {
      return NextResponse.json(
        { ok: false, message: '요청 국고 예산은 1 WLD 이상 2,000,000 WLD 이하여야 합니다.' },
        { status: 400 }
      );
    }

    if (!desc || desc.length < 15) {
      return NextResponse.json(
        { ok: false, message: '사업 추진 타당성 및 상세 설명은 15자 이상 구체적으로 입력해주세요.' },
        { status: 400 }
      );
    }

    const categoryLabelMap = {
      FEE_CUT: '수수료 감면',
      COMMUNITY_FUND: '길드 지원',
      MARKET_MAKING: '시장 조성',
      PUBLIC_EVENT: '공공 이벤트',
    };

    const newProposal: TreasuryDaoProposal = {
      id: `prop-${Date.now().toString(36)}`,
      title,
      category: body.category || 'COMMUNITY_FUND',
      categoryLabel: categoryLabelMap[body.category || 'COMMUNITY_FUND'],
      requestedBudgetWld: budget,
      proposerMasked: 'citizen***me',
      description: desc,
      votesCount: 1,
      targetVotes: 1000,
      status: 'VOTING',
      createdAt: new Date().toISOString(),
      hasVoted: true,
    };

    // 디스코드 실시간 브로드캐스트 연동 (Fire & Forget)
    try {
      const botUrl = process.env.DISCORD_BOT_BROADCAST_URL || 'http://127.0.0.1:3099/broadcast';
      fetch(botUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TREASURY_PROPOSAL',
          title: `🗳️ [주민참여예산] 신규 공공사업 제안 발의!`,
          description: `**"${newProposal.title}"**\n${desc}`,
          fields: [
            { name: '요청 예산', value: `${budget.toLocaleString()} WLD`, inline: true },
            { name: '분류', value: newProposal.categoryLabel, inline: true },
            { name: '목표 투표수', value: '1,000표', inline: true },
          ],
          color: 0x10b981, // Emerald
          notifyAdminDm: true,
        }),
      }).catch(() => {});
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      ok: true,
      message: '주민참여예산 공공사업이 성공적으로 발의되었습니다! 찬성 투표가 개시되었습니다.',
      proposal: newProposal,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const isLoggedIn = await isLoggedInMember();
    if (!isLoggedIn) {
      return NextResponse.json(
        { ok: false, message: '투표는 로그인한 시민만 참여할 수 있습니다.' },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      proposalId?: string;
      title?: string;
      currentVotes?: number;
    };

    if (!body.proposalId) {
      return NextResponse.json(
        { ok: false, message: '제안 ID가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const nextVotes = (body.currentVotes ?? 0) + 1;
    const isPassed = nextVotes >= 1000;

    if (isPassed && body.title) {
      try {
        const botUrl = process.env.DISCORD_BOT_BROADCAST_URL || 'http://127.0.0.1:3099/broadcast';
        fetch(botUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'DAO_VOTING_PASSED',
            title: `🎉 [주민참여예산] 1,000표 달성! 사업안 가결`,
            description: `시민 투표 1,000표를 돌파하여 **"${body.title}"** 공공사업이 공식 가결(PASSED)되었습니다. 관리자 승인 후 국고 집행이 개시됩니다.`,
            fields: [
              { name: '달성 투표수', value: `${nextVotes.toLocaleString()}표`, inline: true },
              { name: '상태', value: '가결 (집행 대기)', inline: true },
            ],
            color: 0x3b82f6, // Blue
            notifyAdminDm: true,
          }),
        }).catch(() => {});
      } catch {
        // non-blocking
      }
    }

    return NextResponse.json({
      ok: true,
      message: isPassed
        ? '축하합니다! 1,000표 달성으로 공공사업이 가결(PASSED)되었습니다!'
        : '국고 공공사업 찬성 투표가 정상 반영되었습니다 (+1표).',
      proposalId: body.proposalId,
      votesCount: nextVotes,
      status: isPassed ? 'PASSED' : 'VOTING',
      votedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
