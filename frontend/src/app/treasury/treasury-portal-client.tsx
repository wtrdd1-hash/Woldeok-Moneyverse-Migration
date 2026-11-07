'use client';

import React, { useState } from 'react';
import {
  Landmark,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  History,
  Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TREASURY_PROGRAMS,
  type TreasuryOverviewData,
  type TreasuryLedgerItem,
  type UserEligibilityStatus,
} from './treasury.types';
import { TreasuryReserveGauge } from './treasury-reserve-gauge';
import { TreasuryProgramCard } from './treasury-program-card';
import { TreasuryDaoVoting } from './treasury-dao-voting';

interface TreasuryPortalClientProps {
  readonly initialOverview: TreasuryOverviewData;
  readonly initialLedger: readonly TreasuryLedgerItem[];
  readonly initialEligibility: UserEligibilityStatus;
  readonly isEn?: boolean | undefined;
}

export function TreasuryPortalClient({
  initialOverview,
  initialLedger,
  initialEligibility,
  isEn = false,
}: TreasuryPortalClientProps) {
  const [overview] = useState<TreasuryOverviewData>(initialOverview);
  const [ledger, setLedger] = useState<readonly TreasuryLedgerItem[]>(initialLedger);
  const [eligibility, setEligibility] = useState<UserEligibilityStatus>(initialEligibility);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // 모달 & 토스트 상태
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantBusinessName, setGrantBusinessName] = useState('');
  const [grantApplicantName, setGrantApplicantName] = useState('');
  const [grantTier, setGrantTier] = useState<'TIER_1_SEED' | 'TIER_2_GROWTH' | 'TIER_3_INNOVATION'>('TIER_1_SEED');
  const [grantCategory, setGrantCategory] = useState<string>('FINTECH');
  const [grantPlan, setGrantPlan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // 즉시 수령 처리 (Claim)
  const handleClaim = async (programId: string) => {
    try {
      const res = await fetch('/api/treasury/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        showToast('error', data.message || '수령 처리에 실패했습니다.');
        return;
      }

      showToast('success', data.message);

      // 자격 상태 쿨다운 반영
      if (programId === 'CITIZEN_DIVIDEND') {
        setEligibility((prev) => ({ ...prev, citizenDividendEligible: false }));
      } else if (programId === 'EMERGENCY_RELIEF') {
        setEligibility((prev) => ({ ...prev, emergencyReliefEligible: false }));
      } else if (programId === 'BOND_YIELD_BOOSTER') {
        setEligibility((prev) => ({ ...prev, bondBoosterEligible: false }));
      }

      // 원장 맨 앞에 추가
      const newEntry: TreasuryLedgerItem = {
        id: `disb-${Date.now()}`,
        txType: programId,
        txTypeLabel:
          programId === 'CITIZEN_DIVIDEND'
            ? '시민 기본배당'
            : programId === 'EMERGENCY_RELIEF'
            ? '긴급 구호금'
            : '국채 금리 부스터',
        amountWld: (data.disbursedAmountWld || 1200).toLocaleString(),
        reason: `${programId} 대국민 국고 혜택 즉시 지급 완료`,
        beneficiaryMasked: 'me (본인 계좌)',
        createdAt: new Date().toISOString(),
      };
      setLedger((prev) => [newEntry, ...prev]);
    } catch {
      showToast('error', '네트워크 통신 중 오류가 발생했습니다.');
    }
  };

  // 창업 그랜트 신청서 제출
  const handleGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/treasury/apply-grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: grantApplicantName,
          businessName: grantBusinessName,
          businessPlan: grantPlan,
          category: grantCategory,
          tier: grantTier,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        showToast('error', data.message || '신청서 접수에 실패했습니다.');
        setIsSubmitting(false);
        return;
      }

      showToast('success', data.message);
      setGrantModalOpen(false);
      setGrantBusinessName('');
      setGrantPlan('');
      setEligibility((prev) => ({ ...prev, activeGrantApplied: true }));
    } catch {
      showToast('error', '신청서 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPrograms = TREASURY_PROGRAMS.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* 플로팅 토스트 알림 */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 p-4 rounded-xl border shadow-lg backdrop-blur-md animate-in slide-in-from-bottom-5 font-mono text-xs ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 1. 국고 총잔액 & 30% 법정 안전 비축금 게이지 */}
      <TreasuryReserveGauge overview={overview} isEn={isEn} />

      {/* 2. 5대 국고 핵심 활용처 탭 & 카드 그리드 섹션 */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Landmark className="size-5 text-primary" />
              <span>{isEn ? 'National Treasury Programs' : '5대 국고 핵심 활용 프로그램'}</span>
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {isEn
                ? 'Public expenditure & wealth redistribution programs backed by national reserves'
                : '국고 재정 잉여금을 시민 복지, 벤처 육성, 통화가치 안정으로 직접 환원합니다.'}
            </p>
          </div>

          {/* 카테고리 필터 탭 */}
          <div
            className="inline-flex rounded-xl border border-border/80 bg-muted/40 p-1 self-start sm:self-auto shadow-inner text-xs font-bold"
            role="tablist"
          >
            {[
              { id: 'ALL', label: isEn ? 'All' : '전체' },
              { id: 'DIVIDEND', label: isEn ? 'Dividend' : '기본배당' },
              { id: 'VENTURE', label: isEn ? 'Venture' : '창업지원' },
              { id: 'WELFARE', label: isEn ? 'Welfare' : '긴급복지' },
              { id: 'MACRO', label: isEn ? 'Deflation' : '통화안정' },
              { id: 'FINANCE', label: isEn ? 'Finance' : '국채우대' },
            ].map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 프로그램 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map((prog) => (
            <TreasuryProgramCard
              key={prog.id}
              program={prog}
              eligibility={eligibility}
              onClaim={handleClaim}
              onOpenGrantModal={() => setGrantModalOpen(true)}
              isEn={isEn}
            />
          ))}
        </div>
      </div>

      {/* 3. 시민 참여형 주민참여예산(DAO Budget Voting) 거버넌스 섹션 */}
      <TreasuryDaoVoting isLoggedIn={eligibility.isLoggedIn} isEn={isEn} />

      {/* 4. 실시간 투명 대국민 지출 원장(Ledger) 스트림 테이블 */}
      <Card className="moneyverse-card border-border/80 bg-card/75 shadow-sm overflow-hidden backdrop-blur-md">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <History className="size-4 text-purple-400" />
                <span>{isEn ? 'Public Disbursement Ledger' : '실시간 투명 국고 지출 원장'}</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {isEn
                  ? 'Only independently verified fiscal disbursements may appear in this feed'
                  : '검증 완료된 국고 지출만 공개합니다. 현재 독립 원장 대사가 완료되지 않았습니다.'}
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-[11px] text-muted-foreground">
              원장 검증 대기
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs font-bold text-muted-foreground">{isEn ? 'Type' : '지출 구분'}</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">{isEn ? 'Amount' : '집행 금액'}</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">{isEn ? 'Reason & Target' : '지출 사유 및 수혜자'}</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground text-right">{isEn ? 'Timestamp' : '집행 일시'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="p-5 text-center text-muted-foreground">
                    {isEn ? 'No independently verified disbursements available.' : '독립 복식원장 검증 전으로 지급 내역을 공개할 수 없습니다.'}
                  </TableCell></TableRow>
                )}
                {ledger.map((item) => (
                  <TableRow key={item.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">
                      <Badge variant="outline" className="text-[10px] bg-muted/50 border-border/60">
                        {item.txTypeLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-foreground tabular-nums">
                      <span className="text-primary">{item.amountWld}</span> WLD
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium text-foreground">{item.reason}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">수혜: {item.beneficiaryMasked}</div>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground text-right whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 4. 창업 그랜트 지원 신청 모달 다이얼로그 */}
      {grantModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 sm:p-6 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setGrantModalOpen(false);
          }}
        >
          <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
            <div className="relative w-full max-w-xl rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Coins className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      대국민 벤처 창업 지원금 신청
                    </h2>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      복지금고(VAULT_WELFARE) 원자적 자금 집행 및 14일 의무 창업제
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setGrantModalOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* 핵심 안내 배지 */}
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs space-y-1">
                <div className="font-bold text-sky-400 flex items-center gap-1.5">
                  <span>💡 3단계 차등 지원 & 1차 AI 스코어링 안내</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  신청서 제출 즉시 1차 AI 적격 스코어링(0~100점)이 산출되며 국고 심사관의 원클릭 검토를 거쳐 복지금고에서 지갑으로 원자적 복식부기 입금됩니다. 승인 후 14일 이내 가상 사업체(/businesses)를 미창업 시 잔여 지원금은 국고로 자동 환수(Clawback)됩니다.
                </p>
              </div>

              <form onSubmit={handleGrantSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground block">
                      대표자명 / 팀명 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="예: 홍길동, 퀀트랩팀"
                      value={grantApplicantName}
                      onChange={(e) => setGrantApplicantName(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground block">
                      사업체 명칭 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="예: 네오스왑 핀테크, 메가물류"
                      value={grantBusinessName}
                      onChange={(e) => setGrantBusinessName(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary font-medium"
                    />
                  </div>
                </div>

                {/* 3단계 티어 선택 */}
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">
                    지원금 티어 선택 (WLD) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label
                      className={"flex flex-col p-3 rounded-xl border cursor-pointer transition-colors " +
                        (grantTier === 'TIER_1_SEED'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-border/60 bg-muted/20 hover:bg-muted/40')}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">Tier 1 시드</span>
                        <input
                          type="radio"
                          name="tier"
                          value="TIER_1_SEED"
                          checked={grantTier === 'TIER_1_SEED'}
                          onChange={() => setGrantTier('TIER_1_SEED')}
                          className="text-emerald-500"
                        />
                      </div>
                      <span className="text-sm font-bold font-mono text-emerald-400 mt-1">500,000 WLD</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">소상공인·초기 스타트업</span>
                    </label>

                    <label
                      className={"flex flex-col p-3 rounded-xl border cursor-pointer transition-colors " +
                        (grantTier === 'TIER_2_GROWTH'
                          ? 'border-sky-500 bg-sky-500/10'
                          : 'border-border/60 bg-muted/20 hover:bg-muted/40')}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">Tier 2 성장형</span>
                        <input
                          type="radio"
                          name="tier"
                          value="TIER_2_GROWTH"
                          checked={grantTier === 'TIER_2_GROWTH'}
                          onChange={() => setGrantTier('TIER_2_GROWTH')}
                          className="text-sky-500"
                        />
                      </div>
                      <span className="text-sm font-bold font-mono text-sky-400 mt-1">2,000,000 WLD</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">물류·기술형 벤처 기업</span>
                    </label>

                    <label
                      className={"flex flex-col p-3 rounded-xl border cursor-pointer transition-colors " +
                        (grantTier === 'TIER_3_INNOVATION'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-border/60 bg-muted/20 hover:bg-muted/40')}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">Tier 3 혁신형</span>
                        <input
                          type="radio"
                          name="tier"
                          value="TIER_3_INNOVATION"
                          checked={grantTier === 'TIER_3_INNOVATION'}
                          onChange={() => setGrantTier('TIER_3_INNOVATION')}
                          className="text-purple-500"
                        />
                      </div>
                      <span className="text-sm font-bold font-mono text-purple-400 mt-1">5,000,000 WLD</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">대규모 공공·인프라 혁신</span>
                    </label>
                  </div>
                </div>

                {/* 산업 카테고리 */}
                <div className="space-y-1">
                  <label className="font-bold text-foreground block">
                    업종 분야 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={grantCategory}
                    onChange={(e) => setGrantCategory(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="FINTECH">핀테크 / 분산원장 금융</option>
                    <option value="LOGISTICS">스마트 운송 및 도시 물류</option>
                    <option value="AI_TECH">인공지능 및 데이터 퀀트 리서치</option>
                    <option value="COMMERCE">도시 상업 및 24시 유통</option>
                    <option value="OTHER">기타 신산업 벤처</option>
                  </select>
                </div>

                {/* 사업계획서 요약 */}
                <div className="space-y-1">
                  <label className="font-bold text-foreground block">
                    사업계획서 요약 및 자금 활용처 (최소 20자) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    minLength={20}
                    rows={4}
                    placeholder="창업 비즈니스 모델, 고용 효과, 머니버스 경제 기여도 및 구체적 자금 사용 계획을 20자 이상 기술해 주세요."
                    value={grantPlan}
                    onChange={(e) => setGrantPlan(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                  />
                  <div className="text-[11px] text-muted-foreground text-right font-mono">
                    {grantPlan.length} / 최소 20자
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setGrantModalOpen(false)}
                    className="text-xs h-9 font-medium"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || grantPlan.trim().length < 20}
                    className="text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white h-9 shadow-xs"
                  >
                    {isSubmitting ? '접수 처리 중...' : (
                      <>
                        <Send className="size-3.5 mr-1" />
                        창업 지원금 공식 접수
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
