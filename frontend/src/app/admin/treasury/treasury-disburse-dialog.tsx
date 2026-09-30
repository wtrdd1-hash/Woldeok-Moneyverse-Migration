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
import { disburseCitizenDividendAction, disburseGrantAction } from '../actions';
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
  const [tab, setTab] = useState<'dividend' | 'grant'>('dividend');

  // 배당 탭 상태
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

  // 추정 시민 수 (활성 계정 약 1,705명)
  const estimatedCitizens = 1705;
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
        setMessage({ status: 'ok', text: res.message ?? '공공 지원금 지출이 완료되었습니다.' });
      } else {
        setMessage({ status: 'error', text: res.message ?? '지원금 지출에 실패했습니다.' });
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
        <Button className="font-bold text-xs sm:text-sm gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md">
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
            징수된 국고 세수를 시민 보편 배당 및 공공 프로젝트 보조금으로 환원 집행합니다. (30% 안전 비축금 원칙 강제)
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

          {/* 탭 전환 바 */}
          <div className="inline-flex rounded-xl border border-border/80 bg-muted/60 p-1 mt-4 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setTab('dividend');
                setMessage(null);
              }}
              className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'dividend'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="size-3.5" />
              <span>시민 보편 배당 (기본소득)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('grant');
                setMessage(null);
              }}
              className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'grant'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="size-3.5" />
              <span>공공 프로젝트 & 복지 지원금</span>
            </button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {tab === 'dividend' ? (
            <form onSubmit={handleDividendSubmit} className="space-y-4">
              <div className="rounded-xl border bg-muted/10 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">배당 대상 시민</span>
                  <span className="font-bold text-foreground">활성 시민 전원 (약 {groupDigits(estimatedCitizens)}명)</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="perUserAmount" className="text-xs font-bold text-foreground">
                      1인당 환원 배당액 (WLD)
                    </label>
                    <span className="text-xs font-mono font-bold text-primary">
                      {groupDigits(perUserAmount)} WLD
                    </span>
                  </div>
                  <input
                    id="perUserAmount"
                    type="text"
                    pattern="[0-9]*"
                    placeholder="예: 1000"
                    value={perUserAmount}
                    onChange={(e) => setPerUserAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm font-mono font-bold shadow-xs focus:ring-1 focus:ring-ring"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[500, 1000, 2000, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setPerUserAmount(amt.toString())}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
                      >
                        +{groupDigits(amt)} WLD
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border bg-background p-3 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">총 국고 소요 예산</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      isDividendOverReserve ? 'text-destructive' : 'text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    {groupDigits(totalDividendNeeded.toString())} WLD
                  </span>
                </div>

                {isDividendOverReserve && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>최대 가용 예산({groupDigits(maxAvailable.toString())} WLD)을 초과하여 집행할 수 없습니다.</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="dividendReason" className="block text-xs font-bold text-foreground mb-1.5">
                  국고 배당 감사 사유 (최소 10자 이상)
                </label>
                <textarea
                  id="dividendReason"
                  rows={2}
                  value={dividendReason}
                  onChange={(e) => setDividendReason(e.target.value)}
                  minLength={10}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs sm:text-sm shadow-xs focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <ShieldCheck className="size-4" />
                  <span>Step-Up 관리자 권한 확인</span>
                </div>
                <StepUpField id="dividend-disburse" undo="관리자 권한으로 반대 보정 거래를 수행" />
              </div>

              {message && (
                <div
                  className={`rounded-xl p-3.5 text-xs font-medium ${
                    message.status === 'ok'
                      ? 'border border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'border border-destructive/40 bg-destructive/15 text-destructive'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Button
                type="submit"
                disabled={isPending || isDividendOverReserve || dividendReason.trim().length < 10 || numPerUser <= 0}
                className="w-full min-h-11 font-bold text-xs sm:text-sm rounded-xl shadow-md gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isPending ? (
                  <>
                    <RotateCw className="size-4 animate-spin" />
                    <span>시민 배당금 원자적 일괄 집행 중...</span>
                  </>
                ) : (
                  <>
                    <Coins className="size-4" />
                    <span>시민 보편 배당금 공식 집행 확정</span>
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleGrantSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label htmlFor="grantTypeSelect" className="block text-xs font-bold text-foreground mb-1.5">
                    공공 재정 지출 유형
                  </label>
                  <select
                    id="grantTypeSelect"
                    value={grantType}
                    onChange={(e) => handleGrantCategoryChange(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs sm:text-sm font-medium shadow-xs focus:ring-1 focus:ring-ring"
                  >
                    {GRANT_CATEGORIES.map((cat) => (
                      <option key={cat.type} value={cat.type}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="grantTargetUser" className="block text-xs font-bold text-foreground mb-1.5">
                    수혜 대상 유저 ID (선택: 비워둘 경우 공공 에스크로 계정에 귀속)
                  </label>
                  <input
                    id="grantTargetUser"
                    type="text"
                    placeholder="00000000-0000-0000-0000-000000000000"
                    value={grantTargetUser}
                    onChange={(e) => setGrantTargetUser(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs font-mono shadow-xs focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="grantAmount" className="text-xs font-bold text-foreground">
                      지원금 금액 (WLD)
                    </label>
                    <span className="text-xs font-mono font-bold text-primary">
                      {groupDigits(grantAmount)} WLD
                    </span>
                  </div>
                  <input
                    id="grantAmount"
                    type="text"
                    pattern="[0-9]*"
                    placeholder="예: 50000"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm font-mono font-bold shadow-xs focus:ring-1 focus:ring-ring"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[10000, 50000, 100000, 500000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setGrantAmount(amt.toString())}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
                      >
                        +{groupDigits(amt)} WLD
                      </button>
                    ))}
                  </div>
                </div>

                {isGrantOverReserve && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>최대 가용 예산({groupDigits(maxAvailable.toString())} WLD)을 초과할 수 없습니다.</span>
                  </div>
                )}

                <div>
                  <label htmlFor="grantReason" className="block text-xs font-bold text-foreground mb-1.5">
                    상세 감사 소명 사유 (최소 10자 이상)
                  </label>
                  <textarea
                    id="grantReason"
                    rows={2}
                    value={grantReason}
                    onChange={(e) => setGrantReason(e.target.value)}
                    minLength={10}
                    required
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs sm:text-sm shadow-xs focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <ShieldCheck className="size-4" />
                  <span>Step-Up 관리자 권한 확인</span>
                </div>
                <StepUpField id="grant-disburse" undo="관리자 권한으로 반대 보정 거래를 수행" />
              </div>

              {message && (
                <div
                  className={`rounded-xl p-3.5 text-xs font-medium ${
                    message.status === 'ok'
                      ? 'border border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'border border-destructive/40 bg-destructive/15 text-destructive'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Button
                type="submit"
                disabled={isPending || isGrantOverReserve || grantReason.trim().length < 10 || numGrantAmount <= BigInt(0)}
                className="w-full min-h-11 font-bold text-xs sm:text-sm rounded-xl shadow-md gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isPending ? (
                  <>
                    <RotateCw className="size-4 animate-spin" />
                    <span>공공 지원금 지출 집행 중...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="size-4" />
                    <span>공공 재정 지원금 지출 확정</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
