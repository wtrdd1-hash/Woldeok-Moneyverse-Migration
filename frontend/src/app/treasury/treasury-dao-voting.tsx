'use client';

import React, { useState, useEffect } from 'react';
import {
  Vote,
  PlusCircle,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Coins,
  Send,
  X,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TreasuryDaoProposal } from './treasury.types';

interface TreasuryDaoVotingProps {
  readonly isLoggedIn: boolean;
  readonly isEn?: boolean | undefined;
}

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

export function TreasuryDaoVoting({ isLoggedIn, isEn = false }: TreasuryDaoVotingProps) {
  const [proposals, setProposals] = useState<TreasuryDaoProposal[]>(DEFAULT_PROPOSALS);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'FEE_CUT' | 'COMMUNITY_FUND' | 'MARKET_MAKING' | 'PUBLIC_EVENT'>('COMMUNITY_FUND');
  const [newBudget, setNewBudget] = useState('300000');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // 투표 클릭 핸들러
  const handleVote = async (proposalId: string) => {
    if (!isLoggedIn) {
      setActionMsg('로그인한 시민만 투표에 참여할 수 있습니다.');
      return;
    }

    const targetProp = proposals.find((p) => p.id === proposalId);
    try {
      const res = await fetch('/api/treasury/proposals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId,
          title: targetProp?.title,
          currentVotes: targetProp?.votesCount,
        }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setActionMsg(data.message);
        setProposals((prev) =>
          prev.map((p) =>
            p.id === proposalId
              ? {
                  ...p,
                  votesCount: p.votesCount + 1,
                  hasVoted: true,
                  status: p.votesCount + 1 >= p.targetVotes ? 'PASSED' : p.status,
                }
              : p
          )
        );
      } else {
        setActionMsg(data.message || '투표 반영 실패');
      }
    } catch {
      setActionMsg('투표 처리 중 네트워크 통신 오류가 발생했습니다.');
    }
  };

  // 신규 제안서 제출
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionMsg(null);

    try {
      const res = await fetch('/api/treasury/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          requestedBudgetWld: Number.parseInt(newBudget, 10) || 300000,
          description: newDesc,
        }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setActionMsg(data.message);
        setProposals((prev) => [data.proposal, ...prev]);
        setModalOpen(false);
        setNewTitle('');
        setNewDesc('');
      } else {
        setActionMsg(data.message || '제안 등록 실패');
      }
    } catch {
      setActionMsg('제안 등록 중 통신 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Vote className="size-5 text-indigo-400" />
            <span>{isEn ? 'Citizens DAO Budget Voting' : '시민 참여형 주민참여예산 투표제'}</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {isEn
              ? 'Propose civic projects and vote. Approved initiatives are funded by the National Treasury.'
              : '시민들이 원하는 공공사업을 직접 제안하고 1,000표 달성 시 국고 예산이 자동 집행됩니다.'}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="size-3.5 mr-1" />
          {isEn ? 'Propose New Initiative' : '새 공공사업 발의하기'}
        </Button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 shrink-0" />
            <span>{actionMsg}</span>
          </div>
          <button type="button" onClick={() => setActionMsg(null)} className="hover:opacity-75">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 제안 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {proposals.map((item) => {
          const votePct = Math.min(100, Math.round((item.votesCount / item.targetVotes) * 100));
          const isPassed = item.status === 'PASSED' || item.status === 'EXECUTED';

          return (
            <Card
              key={item.id}
              className="moneyverse-card border-border/80 bg-card/65 shadow-sm flex flex-col justify-between overflow-hidden"
            >
              <CardHeader className="p-4 sm:p-5 pb-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                    {item.categoryLabel}
                  </Badge>
                  {isPassed ? (
                    <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                      <CheckCircle2 className="size-3 mr-1" />
                      의결 통과
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-[10px] font-mono">
                      <Clock className="size-3 mr-1" />
                      투표 진행 중
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-sm sm:text-base font-bold text-foreground leading-snug">
                  {item.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-0 space-y-3.5 flex-1 flex flex-col justify-between">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                <div className="space-y-2 pt-1 border-t border-border/40">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Coins className="size-3 text-amber-400" />
                      필요 국고:
                    </span>
                    <span className="font-bold text-primary tabular-nums">
                      {item.requestedBudgetWld.toLocaleString()} WLD
                    </span>
                  </div>

                  {/* 투표 진척 게이지 바 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono font-semibold">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Target className="size-3 text-indigo-400" />
                        찬성 {item.votesCount}표 / {item.targetVotes}표
                      </span>
                      <span className="text-indigo-400 font-bold">{votePct}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isPassed ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${votePct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    size="sm"
                    disabled={isPassed || item.hasVoted}
                    onClick={() => handleVote(item.id)}
                    className={`w-full text-xs font-bold shadow-xs ${
                      isPassed
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                        : item.hasVoted
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isPassed ? (
                      <>
                        <CheckCircle2 className="size-3.5 mr-1" />
                        예산 집행 확정됨
                      </>
                    ) : item.hasVoted ? (
                      <>
                        <CheckCircle2 className="size-3.5 mr-1 text-emerald-400" />
                        찬성 투표 완료
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="size-3.5 mr-1" />
                        찬성 투표하기 (+1)
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 신규 공공사업 발의 모달 다이얼로그 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Vote className="size-5 text-indigo-400" />
                  <span>새 주민참여예산 공공사업 발의</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  시민 1,000표 달성 시 중앙정부 국고에서 해당 예산이 즉시 자동 집행됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  공공사업 명칭 (최소 5자) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 주말 주식 거래 수수료 50% 국고 캐시백 지원"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">
                    사업 분류
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="FEE_CUT">수수료 감면</option>
                    <option value="COMMUNITY_FUND">길드 지원</option>
                    <option value="MARKET_MAKING">시장 조성</option>
                    <option value="PUBLIC_EVENT">공공 이벤트</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">
                    필요 국고 예산 (WLD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={10000}
                    max={2000000}
                    step={10000}
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  사업 추진 타당성 및 상세 계획 (최소 15자) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="이 공공사업이 머니버스 시민 전체에게 어떤 이익과 공공 복지를 가져다주는지 설명해 주세요."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="text-xs"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {isSubmitting ? '발의 중...' : (
                    <>
                      <Send className="size-3.5 mr-1" />
                      주민예산 공공사업 정식 발의
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
