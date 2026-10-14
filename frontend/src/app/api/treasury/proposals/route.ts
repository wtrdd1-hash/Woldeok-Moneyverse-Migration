import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { isLoggedInMember } from '@/lib/session';
import type { TreasuryDaoProposal } from '@/app/treasury/treasury.types';

export const dynamic = 'force-dynamic';

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

function getProposalsFilePath(): string {
  const sharedDir = '/srv/moneyverse-data/shared/data';
  if (fs.existsSync('/srv/moneyverse-data/shared')) {
    if (!fs.existsSync(sharedDir)) {
      try {
        fs.mkdirSync(sharedDir, { recursive: true });
      } catch (err) {
        console.debug('[proposals] mkdir sharedDir error:', err);
      }
    }
    return path.join(sharedDir, 'treasury-proposals.json');
  }
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (err) {
      console.debug('[proposals] mkdir dataDir error:', err);
    }
  }
  return path.join(dataDir, 'treasury-proposals.json');
}

function loadProposals(): TreasuryDaoProposal[] {
  try {
    const filePath = getProposalsFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as TreasuryDaoProposal[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((p) => p.id));
        const combined = [...parsed];
        for (const def of DEFAULT_PROPOSALS) {
          if (!existingIds.has(def.id)) {
            combined.push(def);
          }
        }
        return combined;
      }
    }
  } catch (err) {
    console.error('[TreasuryProposals] Failed to read from disk:', err);
  }
  return [...DEFAULT_PROPOSALS];
}

function saveProposals(proposals: TreasuryDaoProposal[]): void {
  try {
    const filePath = getProposalsFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(proposals, null, 2), 'utf-8');
  } catch (err) {
    console.error('[TreasuryProposals] Failed to write to disk:', err);
  }
}

export async function GET() {
  const proposals = loadProposals();
  return NextResponse.json({
    ok: true,
    proposals,
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
        { ok: false, message: '사업안 제목은 최소 5자 이상 작성해야 합니다.' },
        { status: 400 }
      );
    }

    if (budget < 10000 || budget > 5000000) {
      return NextResponse.json(
        { ok: false, message: '요청 국고 예산은 10,000 WLD ~ 5,000,000 WLD 사이여야 합니다.' },
        { status: 400 }
      );
    }

    if (!desc || desc.length < 20) {
      return NextResponse.json(
        { ok: false, message: '사업 제안 취지와 기대 효과를 최소 20자 이상 상세히 기술해주세요.' },
        { status: 400 }
      );
    }

    const categoryMap: Record<string, string> = {
      FEE_CUT: '수수료 감면',
      COMMUNITY_FUND: '길드 지원',
      MARKET_MAKING: '시장 조성',
      PUBLIC_EVENT: '공공 이벤트',
    };

    const category = body.category && categoryMap[body.category] ? body.category : 'FEE_CUT';

    const newProposal: TreasuryDaoProposal = {
      id: `prop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      category,
      categoryLabel: categoryMap[category] || '공공사업',
      requestedBudgetWld: budget,
      proposerMasked: 'citizen***active',
      description: desc,
      votesCount: 1, // 발의자 본인 찬성 1표
      targetVotes: 1000,
      status: 'VOTING',
      createdAt: new Date().toISOString(),
    };

    // R06 해결: 디스크 영속 저장소에 실시간 추가 보존
    const currentList = loadProposals();
    const updatedList = [newProposal, ...currentList.filter((p) => p.id !== newProposal.id)];
    saveProposals(updatedList);

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
    };

    if (!body.proposalId) {
      return NextResponse.json(
        { ok: false, message: '제안 ID가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // R06 해결: 클라이언트의 currentVotes를 신뢰하지 않고 디스크의 실제 제안 객체를 조회 및 서버 권위 집계
    const proposals = loadProposals();
    const targetProposal = proposals.find((p) => p.id === body.proposalId);

    if (!targetProposal) {
      return NextResponse.json(
        { ok: false, message: '존재하지 않는 주민참여예산 제안입니다.' },
        { status: 404 }
      );
    }

    if (targetProposal.status === 'PASSED') {
      return NextResponse.json(
        { ok: false, message: '이미 1,000표를 달성하여 가결 완료된 공공사업입니다.' },
        { status: 400 }
      );
    }

    // 서버 권위 1표 가산
    const nextVotes = targetProposal.votesCount + 1;
    const isPassed = nextVotes >= targetProposal.targetVotes;
    const nextStatus = isPassed ? ('PASSED' as const) : targetProposal.status;

    const updatedProposals = proposals.map((p) => {
      if (p.id === body.proposalId) {
        return {
          ...p,
          votesCount: nextVotes,
          status: nextStatus,
        };
      }
      return p;
    });

    saveProposals(updatedProposals);

    return NextResponse.json({
      ok: true,
      message: isPassed
        ? '축하합니다! 1,000표 달성으로 공공사업이 가결(PASSED)되었습니다!'
        : '국고 공공사업 찬성 투표가 정상 반영되었습니다 (+1표).',
      proposalId: targetProposal.id,
      votesCount: nextVotes,
      status: nextStatus,
      votedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
