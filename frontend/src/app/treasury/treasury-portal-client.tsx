'use client';

import React, { useState } from 'react';
import {
  Landmark,
  FileText,
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
  type TreasuryProgramId,
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
  const [grantAmount, setGrantAmount] = useState('50000');
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
          businessName: grantBusinessName,
          requestedAmountWld: Number.parseInt(grantAmount, 10) || 50000,
          businessPlan: grantPlan,
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
                  ? 'All treasury disbursements are immutably verified and audited'
                  : '중앙정부 국고에서 집행된 모든 지원금 및 소각 내역을 투명하게 공시합니다.'}
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-[11px] text-muted-foreground">
              블록체인 불변 원장
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Coins className="size-5 text-sky-400" />
                  <span>청년·창업 벤처 그랜트 신청서</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  국고 무상 지원금(최대 100,000 WLD) 심사를 위한 프로젝트 기획서 접수
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGrantModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleGrantSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  기업명 또는 프로젝트명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 델타 트레이딩 랩스, 머니버스 AMM 거래소"
                  value={grantBusinessName}
                  onChange={(e) => setGrantBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  신청 지원금 (WLD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  max={100000}
                  step={1000}
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-mono font-bold"
                />
                <span className="text-[11px] text-muted-foreground">
                  최소 1,000 WLD ~ 최대 100,000 WLD 한도 내에서 신청 가능합니다.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  사업 기획서 및 지원 사유 (최소 10자) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="머니버스 생태계에 어떤 혁신과 가치를 창출할 것인지 구체적으로 기술해 주세요."
                  value={grantPlan}
                  onChange={(e) => setGrantPlan(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGrantModalOpen(false)}
                  className="text-xs"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white"
                >
                  {isSubmitting ? '접수 중...' : (
                    <>
                      <Send className="size-3.5 mr-1" />
                      신청서 공식 접수
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
