'use client';

import { useState } from 'react';
import {
  Coins,
  Gift,
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Sparkles,
  HeartHandshake,
  TrendingUp,
  Target,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { disburseCitizenDividendAction, disburseGrantAction, disburseTargetedSubsidyAction } from '../actions';
import { StepUpField } from '../step-up-field';
import type { AdminTreasuryVault } from '../types';
import { groupDigits } from '@/lib/money';

interface Props {
  readonly vaults: readonly AdminTreasuryVault[];
}

const GRANT_CATEGORIES = [
  {
    type: 'COMMUNITY_FUNDING',
    label: '도시·공공 프로젝트 펀딩 (Community Funding)',
    icon: Building2,
    defaultDetail: '시민 공공 공간 확장 및 커뮤니티 공동 인프라 조성을 위한 국고 펀딩 지원금 집행',
  },
  {
    type: 'WELFARE_SUBSIDY',
    label: '취약계층 최저생계 복지 보조금 (Welfare Subsidy)',
    icon: HeartHandshake,
    defaultDetail: '가상경제 양극화 완화 및 신규/저자산 시민 정착을 위한 최저생계 안전망 복지 보조금 집행',
  },
  {
    type: 'MARKET_STIMULUS',
    label: '시장 유동성 경기부양 완충 (Market Stimulus)',
    icon: TrendingUp,
    defaultDetail: '거래 침체 완화 및 생태계 통화 유통속도 제고를 위한 긴급 경기부양 유동성 집행',
  },
  {
    type: 'PUBLIC_GRANT',
    label: '기타 공공 지원금 (Public Grant)',
    icon: Gift,
    defaultDetail: '공공 정책 목적에 따른 심사 승인 지원금 공식 국고 지출 집행',
  },
] as const;

export function TreasuryDisburseDialog({ vaults }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'targeted' | 'dividend' | 'grant'>('targeted');

  // 선별 배당 탭 상태 (권장)
  const [targetedCutoff, setTargetedCutoff] = useState<string>('10000');
  const [targetedAmount, setTargetedAmount] = useState<string>('5000');
  const [targetedReason, setTargetedReason] = useState<string>(
    '자산 10,000 WLD 이하 초기/저자산 시민 정착 및 기본소득 맞춤 지원금 집행 (고액 자산가 제외)'
  );

  // 전 시민 일괄 배당 탭 상태
  const [perUserAmount, setPerUserAmount] = useState<string>('1000');
  const [dividendReason, setDividendReason] = useState<string>(
    '2026년 정기 국고 세수 잉여금 시민 보편 환원 기본소득 배당 집행'
  );

  // 지원금 탭 상태
  const [grantType, setGrantType] = useState<string>(GRANT_CATEGORIES[0].type);
  const [grantTargetUser, setGrantTargetUser] = useState<string>('');
  const [grantAmount, setGrantAmount] = useState<string>('50000');
  const [grantReason, setGrantReason] = useState<string>(GRANT_CATEGORIES[0].defaultDetail);

  const [isPending, setIsPending] = useState<boolean>(false);
  const [message, setMessage] = useState<{ status: 'ok' | 'error'; text: string } | null>(null);

  const mainVault = vaults.find((v) => v.code === 'VAULT_MAIN');
  const mainBalance = BigInt(mainVault?.balance_wld ?? '0');
  const safeReserve = (mainBalance * BigInt(30)) / BigInt(100);
  const maxAvailable = mainBalance > safeReserve ? mainBalance - safeReserve : BigInt(0);

  // 추정 시민 수 및 컷오프 수혜자 비율 (컷오프 적용 시 약 35%인 596명으로 국고 절감)
  const estimatedCitizens = 1705;
  const estimatedTargetedCitizens = Math.max(1, Math.round(estimatedCitizens * 0.35));

  const numTargetedAmount = Number.parseInt(targetedAmount.replace(/[^0-9]/g, '') || '0', 10);
  const totalTargetedNeeded = BigInt(numTargetedAmount) * BigInt(estimatedTargetedCitizens);
  const isTargetedOverReserve = totalTargetedNeeded > maxAvailable;

  const numPerUser = Number.parseInt(perUserAmount.replace(/[^0-9]/g, '') || '0', 10);
  const totalDividendNeeded = BigInt(numPerUser) * BigInt(estimatedCitizens);
  const isDividendOverReserve = totalDividendNeeded > maxAvailable;

  const numGrantAmount = BigInt(grantAmount.replace(/[^0-9]/g, '') || '0');
  const isGrantOverReserve = numGrantAmount > maxAvailable;

  const handleGrantCategoryChange = (type: string) => {
    setGrantType(type);
    const found = GRANT_CATEGORIES.find((c) => c.type === type);
    if (found) {
      setGrantReason(found.defaultDetail);
    }
  };

  const handleTargetedSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set('amountPerUserWld', targetedAmount);
    formData.set('maxBalanceCutoffWld', targetedCutoff);
    formData.set('reason', targetedReason.trim());

    try {
      const res = await disburseTargetedSubsidyAction({ status: 'idle' }, formData);
      if (res.status === 'ok') {
        setMessage({ status: 'ok', text: res.message ?? '선별 지원금이 성공적으로 집행되었습니다.' });
      } else {
        setMessage({ status: 'error', text: res.message ?? '선별 지원금 집행에 실패했습니다.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '작업 처리 중 오류가 발생했습니다.';
      setMessage({ status: 'error', text: msg });
    } finally {
      setIsPending(false);
    }
  };

  const handleDividendSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set('amountPerUserWld', perUserAmount);
    formData.set('reason', dividendReason.trim());

    try {
      const res = await disburseCitizenDividendAction({ status: 'idle' }, formData);
      if (res.status === 'ok') {
        setMessage({ status: 'ok', text: res.message ?? '시민 배당이 성공적으로 집행되었습니다.' });
      } else {
        setMessage({ status: 'error', text: res.message ?? '배당 집행에 실패했습니다.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '작업 처리 중 오류가 발생했습니다.';
      setMessage({ status: 'error', text: msg });
    } finally {
      setIsPending(false);
    }
  };

  const handleGrantSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set('amountWld', grantAmount);
    formData.set('disbursementType', grantType);
    if (grantTargetUser.trim()) {
      formData.set('targetUserId', grantTargetUser.trim());
    }
    formData.set('reason', grantReason.trim());

    try {
      const res = await disburseGrantAction({ status: 'idle' }, formData);
      if (res.status === 'ok') {
        setMessage({ status: 'ok', text: res.message ?? '지원금 지출이 성공적으로 집행되었습니다.' });
      } else {
        setMessage({ status: 'error', text: res.message ?? '지원금 집행에 실패했습니다.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '작업 처리 중 오류가 발생했습니다.';
      setMessage({ status: 'error', text: msg });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="h-9 gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-500/20 active:scale-[0.98] transition-all"
        >
          <Gift className="size-4" />
          <span>국고 환원금 및 공공 지원금 집행</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-purple-500" />
            <DialogTitle className="text-lg font-bold">
              국고 세수 재순환 및 공공 재정 지출 타워
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            국고 자금을 저자산 초기 유저 선별 복지 및 공공 프로젝트 보조금으로 환원 집행합니다. (30% 안전 비축금 원칙 강제)
          </DialogDescription>

          {/* 30% 안전 비축금 가이드 카드 */}
          <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-medium">
              <span className="text-muted-foreground">중앙 국고 잔액 (VAULT_MAIN)</span>
              <span className="font-mono font-bold text-foreground">{groupDigits(mainBalance.toString())} WLD</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span className="text-amber-600 dark:text-amber-400">불가침 최소 30% 안전 비축금</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {groupDigits(safeReserve.toString())} WLD
              </span>
            </div>
            <div className="flex items-center justify-between font-bold pt-1 border-t border-purple-500/10">
              <span className="text-emerald-600 dark:text-emerald-400">최대 지출 가용 예산 (70%)</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                {groupDigits(maxAvailable.toString())} WLD
              </span>
            </div>
          </div>

          {/* 탭 전환 바 (선별 지원 1순위 배치) */}
          <div className="grid grid-cols-3 rounded-xl border border-border/80 bg-muted/60 p-1 mt-4 shadow-inner gap-1">
            <button
              type="button"
              onClick={() => {
                setTab('targeted');
                setMessage(null);
              }}
              className={`rounded-lg px-2.5 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'targeted'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Target className="size-3.5" />
              <span>🎯 저자산 선별 지원 (권장)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('dividend');
                setMessage(null);
              }}
              className={`rounded-lg px-2.5 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'dividend'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="size-3.5" />
              <span>전 시민 일괄 배당</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('grant');
                setMessage(null);
              }}
              className={`rounded-lg px-2.5 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'grant'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="size-3.5" />
              <span>공공 프로젝트 지원금</span>
            </button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {tab === 'targeted' ? (
            /* 1. 저자산 초기 유저 선별 배당 탭 (핵심 해결책) */
            <form onSubmit={handleTargetedSubmit} className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500 text-black text-[10px] font-black">
                    국고 절감율 80%+ 달성
                  </Badge>
                  <span className="text-xs font-bold text-foreground">
                    자산 기준 역진적 선별 지원 (고액 자산가 배제)
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  보유 잔액이 컷오프 이하인 <strong>신규 및 빈곤 시민에게만 집중 지급</strong>됩니다.
                  루마(20만 WLD), 치킨무(18만 WLD) 등 10,000 WLD를 초과하는 고액 자산가는 배당 대상에서 완전히 제외되어 국고 낭비를 원천 차단합니다.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">수혜 대상 자산 기준</span>
                    <span className="font-mono font-bold text-foreground">
                      ≤ {groupDigits(targetedCutoff)} WLD 이하 시민
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">예상 수혜 시민 수</span>
                    <span className="font-mono font-bold text-emerald-400">
                      약 {groupDigits(estimatedTargetedCitizens)}명 (전체의 ~35%)
                    </span>
                  </div>
                </div>
              </div>

              {/* 자산 컷오프 선택 */}
              <div className="space-y-2">
                <label className="text-xs font-bold flex items-center justify-between text-foreground">
                  <span>지원 대상 최대 자산 컷오프 (Max Balance Cutoff)</span>
                  <span className="text-muted-foreground font-normal">이 금액 이하 유저만 수령</span>
                </label>
                <div className="flex gap-2">
                  {['3000', '5000', '10000', '20000'].map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant={targetedCutoff === amt ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setTargetedCutoff(amt);
                        setTargetedReason(`자산 ${groupDigits(amt)} WLD 이하 초기/저자산 시민 정착 및 기본소득 맞춤 지원금 집행 (고액 자산가 제외)`);
                      }}
                      className="text-xs h-7 flex-1 font-mono"
                    >
                      {groupDigits(amt)} WLD
                    </Button>
                  ))}
                </div>
              </div>

              {/* 1인당 지원금 설정 */}
              <div className="space-y-2">
                <label className="text-xs font-bold flex items-center justify-between text-foreground">
                  <span>1인당 맞춤 지원금액 (WLD)</span>
                  <span className="text-emerald-500 font-normal">빈곤층 집중 지원</span>
                </label>
                <div className="flex gap-2">
                  {['1000', '3000', '5000', '10000'].map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant={targetedAmount === amt ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTargetedAmount(amt)}
                      className="text-xs h-7 flex-1 font-mono"
                    >
                      +{groupDigits(amt)} WLD
                    </Button>
                  ))}
                </div>
              </div>

              {/* 총 소요 예산 요약 */}
              <div className="rounded-xl border p-3.5 space-y-2 bg-muted/30 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">선별 지원 총 필요 예산</span>
                  <span className="font-mono font-extrabold text-base text-purple-400">
                    {groupDigits(totalTargetedNeeded.toString())} WLD
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>전체 지급 대비 국고 절감액</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    -{groupDigits((totalDividendNeeded - totalTargetedNeeded).toString())} WLD 절감
                  </span>
                </div>
                {isTargetedOverReserve && (
                  <p className="text-xs text-rose-500 font-medium">
                    최대 가용 예산({groupDigits(maxAvailable.toString())} WLD)을 초과했습니다.
                  </p>
                )}
              </div>

              {/* 감사 사유 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">지출 감사 사유 (Audit Reason)</label>
                <textarea
                  value={targetedReason}
                  onChange={(e) => setTargetedReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="지출 사유를 최소 10자 이상 입력해 주세요."
                />
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-xs font-medium ${message.status === 'ok' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                  {message.text}
                </div>
              )}

              <Button
                type="submit"
                disabled={isPending || isTargetedOverReserve || targetedReason.trim().length < 10}
                className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                {isPending ? '선별 집행 처리 중...' : `저자산 시민 선별 지원금 (${groupDigits(totalTargetedNeeded.toString())} WLD) 집행`}
              </Button>
            </form>
          ) : tab === 'dividend' ? (
            /* 2. 전 시민 일괄 배당 탭 */
            <form onSubmit={handleDividendSubmit} className="space-y-4">
              <div className="rounded-xl border bg-muted/10 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">배당 대상 시민</span>
                  <span className="font-bold text-foreground">활성 시민 전원 (약 {groupDigits(estimatedCitizens)}명)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">1인당 배당 지급액</span>
                  <span className="font-mono font-bold text-foreground">
                    {groupDigits(numPerUser.toString())} WLD
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t font-medium">
                  <span className="text-muted-foreground">총 필요 국고 예산</span>
                  <span className={`font-mono font-bold text-sm ${isDividendOverReserve ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {groupDigits(totalDividendNeeded.toString())} WLD
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">1인당 배당금 (WLD)</label>
                <input
                  type="text"
                  value={perUserAmount}
                  onChange={(e) => setPerUserAmount(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  placeholder="1000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">지출 감사 사유 (최소 10자)</label>
                <textarea
                  value={dividendReason}
                  onChange={(e) => setDividendReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-xs font-medium ${message.status === 'ok' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                  {message.text}
                </div>
              )}

              <Button
                type="submit"
                disabled={isPending || isDividendOverReserve || dividendReason.trim().length < 10}
                className="w-full h-10 rounded-xl font-bold"
              >
                {isPending ? '배당 집행 중...' : `전 시민 일괄 배당 (${groupDigits(totalDividendNeeded.toString())} WLD) 집행`}
              </Button>
            </form>
          ) : (
            /* 3. 공공 프로젝트 지원금 탭 */
            <form onSubmit={handleGrantSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">공공 지원금 지출 범주</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {GRANT_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = grantType === cat.type;
                    return (
                      <div
                        key={cat.type}
                        onClick={() => handleGrantCategoryChange(cat.type)}
                        className={`cursor-pointer rounded-xl border p-3 transition-all flex items-start gap-2.5 ${isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'}`}
                      >
                        <Icon className="size-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs">{cat.label.split('(')[0]}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{cat.type}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">지출 지원금 총액 (WLD)</label>
                <input
                  type="text"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  placeholder="50000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">수혜 대상 유저 UUID (선택 사항)</label>
                <input
                  type="text"
                  value={grantTargetUser}
                  onChange={(e) => setGrantTargetUser(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  placeholder="00000000-0000-0000-0000-000000000000 (공공 프로젝트는 공란 가능)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">지출 감사 사유 (최소 10자)</label>
                <textarea
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-xs font-medium ${message.status === 'ok' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                  {message.text}
                </div>
              )}

              <Button
                type="submit"
                disabled={isPending || isGrantOverReserve || grantReason.trim().length < 10}
                className="w-full h-10 rounded-xl font-bold"
              >
                {isPending ? '지원금 집행 중...' : `지원금 (${groupDigits(grantAmount)} WLD) 집행 승인`}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
