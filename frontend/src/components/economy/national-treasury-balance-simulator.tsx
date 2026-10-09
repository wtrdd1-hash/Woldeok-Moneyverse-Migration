'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Landmark,
  Coins,
  Flame,
  ShieldCheck,
  TrendingUp,
  Percent,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Gift,
  Building2,
  Ticket,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

interface TreasuryMacroStats {
  readonly treasuryBalance: number;
  readonly weeklyLotteryBurn: number;
  readonly marketTaxRevenue: number;
  readonly taylorRuleInterestIncome: number;
}

export function NationalTreasuryBalanceSimulator() {
  // 유저 지갑 모의 잔액 상태 (기본값: 초기 유저 시뮬레이션 250 WLD)
  const [userBalance, setUserBalance] = useState<number>(250);
  const [hasClaimedGrant, setHasClaimedGrant] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  // 거시경제 밸런스 슬라이더 파라미터
  const [weeklyLotteryTickets, setWeeklyLotteryTickets] = useState<number>(5000); // 주간 복권 판매 장수
  const [taylorInterestRate, setTaylorInterestRate] = useState<number>(3.75); // 테일러 칙 기준금리 (%)
  const [newUsersPerWeek, setNewUsersPerWeek] = useState<number>(150); // 주간 신규 유입자 수
  const [activeLoanVolume, setActiveLoanVolume] = useState<number>(2000000); // 활성 대출 총액 (200만 WLD)

  // 국고 기본 지표
  const baseTreasuryReserve = 25000000; // 2,500만 WLD 국고 안전 원금

  // 국고 수지 계산 엔진
  const simulation = useMemo(() => {
    // 1. 국고 세출 (Expenditure / Faucet)
    const grantPerUser = 10000; // 1인당 정착 지원금
    const weeklyGrantExpense = newUsersPerWeek * grantPerUser; // 신규 유저 정착 지원금 지출
    const weeklyWelfareExpense = 150000; // 공공 복지/사회 환원 지출
    const totalWeeklyExpense = weeklyGrantExpense + weeklyWelfareExpense;

    // 2. 국고 세입 및 소각 (Revenue & Sinks)
    // - 복권 1장 100 WLD, 50% 국고 영구 소각 (Sink)
    const lotteryTicketPrice = 100;
    const weeklyLotteryRevenue = weeklyLotteryTickets * lotteryTicketPrice;
    const weeklyLotteryBurn = Math.round(weeklyLotteryRevenue * 0.5); // 50% 영구 소각

    // - 테일러 칙 대출이자 국고 환수 (연이율 환산 주간 수입)
    const weeklyLoanInterestIncome = Math.round((activeLoanVolume * (taylorInterestRate / 100)) / 52);

    // - 증권 및 마켓 거래세 (0.1% 국고 귀속)
    const weeklyMarketTax = 220000;

    const totalWeeklyInflowAndBurn = weeklyLotteryBurn + weeklyLoanInterestIncome + weeklyMarketTax;

    // 3. 순 재정 수지 (Net Fiscal Balance Delta)
    const netFiscalDelta = totalWeeklyInflowAndBurn - totalWeeklyExpense;

    // 4. 인플레이션 억제 지수 (0% ~ 100%)
    const burnRatio = totalWeeklyExpense > 0 ? (totalWeeklyInflowAndBurn / totalWeeklyExpense) * 100 : 100;
    const inflationControlScore = Math.min(100, Math.max(0, Math.round(burnRatio)));

    // 5. 예상 1년 후 국고 잔고
    const projectedYearlyTreasury = baseTreasuryReserve + netFiscalDelta * 52;

    return {
      weeklyGrantExpense,
      weeklyWelfareExpense,
      totalWeeklyExpense,
      weeklyLotteryBurn,
      weeklyLoanInterestIncome,
      weeklyMarketTax,
      totalWeeklyInflowAndBurn,
      netFiscalDelta,
      inflationControlScore,
      projectedYearlyTreasury,
    };
  }, [weeklyLotteryTickets, taylorInterestRate, newUsersPerWeek, activeLoanVolume]);

  // 초기 정착 지원금 청구 핸들러
  const handleClaimResettlementGrant = async () => {
    if (userBalance >= 1000) {
      toast.error('정착 지원금은 보유 자산이 1,000 WLD 미만인 초기 시민에게만 지급됩니다.');
      return;
    }
    if (hasClaimedGrant) {
      toast.info('이미 초기 시민 정착 지원금을 수령하셨습니다.');
      return;
    }

    setIsClaiming(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setUserBalance((prev) => prev + 10000);
      setHasClaimedGrant(true);
      toast.success(
        '국고(VAULT_MAIN)에서 초기 시민 정착 지원금 10,000 WLD가 안전하게 지급되었습니다!',
        { description: '모의 주식 투자 및 정기 예금에 배분하여 자산을 증식해보세요.' }
      );
    } catch {
      toast.error('지원금 청구 중 오류가 발생했습니다.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-zinc-800 bg-[#090C15] text-zinc-100 shadow-2xl overflow-hidden">
      {/* Header */}
      <CardHeader className="p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-950/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Landmark className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  중앙 국고 정착 지원 & 거시경제 밸런스 시뮬레이터
                </CardTitle>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                  v171 ECO-GUARD
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                무분별한 살포를 차단하고, 1,000 WLD 미만 초기 시민에게만 국고 지원금을 지급하며 복권 50% 소각과 수지를 동기화합니다.
              </CardDescription>
            </div>
          </div>

          {/* User Balance State Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <span className="text-muted-foreground">내 모의 잔액:</span>
            <span className="font-bold text-amber-400">{userBalance.toLocaleString()} WLD</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Section 1: 초기 시민 정착 지원금 청구 섹션 */}
        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gift className="size-4 text-amber-400" />
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                국고 초기 시민 정착 보조금 (10,000 WLD 1회 지급)
              </h4>
              {userBalance < 1000 ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                  수령 대상 적격 (자산 1,000 WLD 미만)
                </Badge>
              ) : (
                <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">
                  수령 제외 (기존 보유 자산 1,000 WLD 이상)
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              화폐 무제한 살포로 인한 하이퍼인플레이션을 방지하기 위해, 오직 자산이 1,000 WLD 이하인 신규 시민에게만 국고 안전 기금에서 10,000 WLD를 1회 교부합니다.
            </p>
          </div>

          <Button
            type="button"
            disabled={userBalance >= 1000 || hasClaimedGrant || isClaiming}
            onClick={handleClaimResettlementGrant}
            className={cn(
              'shrink-0 h-10 px-4 rounded-xl text-xs font-bold transition-all min-h-[40px]',
              hasClaimedGrant
                ? 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                : userBalance < 1000
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md font-extrabold'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
            )}
          >
            {hasClaimedGrant
              ? '✅ 수령 완료'
              : userBalance < 1000
              ? '🎁 10,000 WLD 정착금 청구'
              : '자산 초과 (수령 불가)'}
          </Button>
        </div>

        {/* Section 2: 거시경제 입출 밸런스 시뮬레이션 지표 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 지표 1: 주간 국고 지출 */}
          <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              <ArrowDownRight className="size-3.5 text-rose-400" /> 주간 국고 세출 (Drain)
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-rose-400">
              -{simulation.totalWeeklyExpense.toLocaleString()} WLD
            </div>
            <p className="text-[10px] text-muted-foreground">
              정착금({simulation.weeklyGrantExpense.toLocaleString()}) + 복지
            </p>
          </div>

          {/* 지표 2: 주간 복권 소각 & 회수 */}
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              <Flame className="size-3.5 text-emerald-400" /> 주간 흡수·영구 소각 (Sink)
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-emerald-400">
              +{simulation.totalWeeklyInflowAndBurn.toLocaleString()} WLD
            </div>
            <p className="text-[10px] text-muted-foreground">
              복권50%소각({simulation.weeklyLotteryBurn.toLocaleString()}) + 금리/세수
            </p>
          </div>

          {/* 지표 3: 순 재정 수지 (Net Delta) */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-zinc-900/50 space-y-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              <TrendingUp className="size-3.5 text-primary" /> 순 재정 수지 (Net Delta)
            </span>
            <div
              className={cn(
                'text-base sm:text-lg font-mono font-bold',
                simulation.netFiscalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {simulation.netFiscalDelta >= 0 ? '+' : ''}
              {simulation.netFiscalDelta.toLocaleString()} WLD/주
            </div>
            <p className="text-[10px] text-muted-foreground">
              {simulation.netFiscalDelta >= 0 ? '통화 가치 안정 (흑자 소각)' : '재정 적자 (소각 증대 필요)'}
            </p>
          </div>

          {/* 지표 4: 인플레이션 억제율 */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-zinc-900/50 space-y-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              <ShieldCheck className="size-3.5 text-indigo-400" /> 인플레이션 통제도
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-indigo-400">
              {simulation.inflationControlScore}%
            </div>
            <p className="text-[10px] text-muted-foreground">
              {simulation.inflationControlScore >= 100 ? '완전 방어 (디플레이션 안정)' : '인플레 주의'}
            </p>
          </div>
        </div>

        {/* Section 3: 거시경제 시뮬레이션 인터랙티브 조절 슬라이더 */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>🎛️</span> 거시경제 파라미터 시뮬레이션
            </h4>
            <span className="text-[11px] text-muted-foreground font-mono">
              슬라이더 변경 시 실시간 수지 반영
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 슬라이더 1: 주간 메가 잭팟 복권 판매량 (50% 영구 소각) */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Ticket className="size-3.5 text-amber-400" /> 주간 메가 복권 판매량
                </Label>
                <span className="font-mono font-bold text-amber-400">
                  {weeklyLotteryTickets.toLocaleString()}장 (소각 {Math.round(weeklyLotteryTickets * 50).toLocaleString()} WLD)
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={20000}
                step={500}
                value={weeklyLotteryTickets}
                onChange={(e) => setWeeklyLotteryTickets(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">
                장당 100 WLD 판매액 중 50%가 국고로 전입되어 즉시 영구 소각(Sink)됩니다.
              </p>
            </div>

            {/* 슬라이더 2: 중앙은행 테일러 칙 기준금리 */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Percent className="size-3.5 text-blue-400" /> 중앙은행 테일러 칙 금리
                </Label>
                <span className="font-mono font-bold text-blue-400">
                  연 {taylorInterestRate.toFixed(2)}%
                </span>
              </div>
              <input
                type="range"
                min={1.5}
                max={8.0}
                step={0.25}
                value={taylorInterestRate}
                onChange={(e) => setTaylorInterestRate(Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">
                금리가 높을수록 대출 이자 회수액이 늘어나 유동성이 국고로 흡수됩니다.
              </p>
            </div>

            {/* 슬라이더 3: 주간 신규 유입자 수 (정착금 지급 대상) */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-emerald-400" /> 주간 신규 유입 시민 수
                </Label>
                <span className="font-mono font-bold text-emerald-400">
                  {newUsersPerWeek}명 (지출 {(newUsersPerWeek * 10000).toLocaleString()} WLD)
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={500}
                step={10}
                value={newUsersPerWeek}
                onChange={(e) => setNewUsersPerWeek(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">
                1,000 WLD 이하 신규 시민에게만 1회성 10,000 WLD가 지급됩니다.
              </p>
            </div>

            {/* 슬라이더 4: 총 활성 담보대출 규모 */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Coins className="size-3.5 text-purple-400" /> 총 활성 대출 잔액 (LTV 70%)
                </Label>
                <span className="font-mono font-bold text-purple-400">
                  {(activeLoanVolume / 10000).toFixed(0)}만 WLD
                </span>
              </div>
              <input
                type="range"
                min={500000}
                max={5000000}
                step={250000}
                value={activeLoanVolume}
                onChange={(e) => setActiveLoanVolume(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">
                주식 및 국채 담보대출 원리금 상환 시 이자분은 전액 국고 세입으로 환수됩니다.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>
            <b>국고 안전 보존 법칙:</b> 마지노선 25,000,000 WLD 이하로 준비금이 하락하지 않도록 소각 메커니즘이 강제 작동합니다.
          </span>
        </div>
        <a
          href="/arcade"
          className="shrink-0 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-foreground font-semibold text-xs transition-colors flex items-center gap-1"
        >
          <span>엔터테인먼트 아케이드 소각 참여</span>
          <span>→</span>
        </a>
      </CardFooter>
    </Card>
  );
}
