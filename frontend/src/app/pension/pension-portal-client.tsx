'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Coins,
  TrendingUp,
  Percent,
  Clock,
  Sparkles,
  HelpCircle,
  Award,
  Wallet,
  CheckCircle2,
  AlertCircle,
  LogOut,
  History,
  Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { groupDigits } from '@/lib/money';

export interface NationalPensionOverview {
  totalAumWld: string;
  totalSubscribersCount: number;
  totalRetiredReceiversCount: number;
  totalPensionPaidWld: string;
  benchmarkAnnualPayoutRate: string;
  vaultMainBalanceWld: string;
}

export interface MyPensionAccount {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  accumulated_contribution_wld: string;
  total_contributions_count: number;
  hourly_payout_rate_bps: number;
  total_payout_received_wld: string;
  last_payout_at?: string;
  retired_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContributionLog {
  id: string;
  amount_wld: string;
  note: string;
  created_at: string;
}

export interface PayoutLog {
  id: string;
  payout_amount_wld: string;
  snapshot_accumulated_wld: string;
  created_at: string;
}

interface PensionPortalClientProps {
  overview: NationalPensionOverview;
  myAccount: MyPensionAccount | null;
  contributions: ContributionLog[];
  payouts: PayoutLog[];
  userCashBalance: number;
  isLoggedIn: boolean;
}

export function PensionPortalClient({
  overview,
  myAccount: initialAccount,
  contributions: initialContributions,
  payouts: initialPayouts,
  userCashBalance: initialCashBalance,
  isLoggedIn,
}: PensionPortalClientProps) {
  const [account, setAccount] = useState<MyPensionAccount | null>(initialAccount);
  const [contributions, setContributions] = useState<ContributionLog[]>(initialContributions);
  const [payouts, setPayouts] = useState<PayoutLog[]>(initialPayouts);
  const [cashBalance, setCashBalance] = useState<number>(initialCashBalance);

  // 기여금 납입 폼
  const [contributeAmount, setContributeAmount] = useState<string>('10000');
  const [contributing, setContributing] = useState(false);

  // 액션 로딩
  const [actionLoading, setActionLoading] = useState(false);

  // 시뮬레이터
  const [simAmount, setSimAmount] = useState<number>(100000);

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'TIER_5_HONOR':
        return { name: 'Tier 5 · 명예원로형', rate: '연 10.5%', hourly: '0.12%', color: 'text-amber-300 border-amber-500/40 bg-amber-500/10' };
      case 'TIER_4_PLATINUM':
        return { name: 'Tier 4 · 플래티넘형', rate: '연 9.6%', hourly: '0.11%', color: 'text-violet-300 border-violet-500/40 bg-violet-500/10' };
      case 'TIER_3_GOLD':
        return { name: 'Tier 3 · 골드은퇴형', rate: '연 8.7%', hourly: '0.10%', color: 'text-yellow-300 border-yellow-500/40 bg-yellow-500/10' };
      case 'TIER_2_CITIZEN':
        return { name: 'Tier 2 · 표준국민형', rate: '연 7.8%', hourly: '0.09%', color: 'text-blue-300 border-blue-500/40 bg-blue-500/10' };
      default:
        return { name: 'Tier 1 · 청년적립형', rate: '연 7.0%', hourly: '0.08%', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10' };
    }
  };

  const handleContribute = async () => {
    if (!isLoggedIn) {
      toast.error('로그인이 필요한 서비스입니다.');
      return;
    }
    const amount = Number(contributeAmount);
    if (isNaN(amount) || amount < 1000) {
      toast.error('최소 1,000 WLD 이상부터 납입할 수 있습니다.');
      return;
    }
    if (amount > cashBalance) {
      toast.error(`지갑 잔액이 부족합니다. (현재: ${cashBalance.toLocaleString()} WLD)`);
      return;
    }

    setContributing(true);
    try {
      const res = await fetch('/api/pension/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountWld: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '납입 실패');

      toast.success(
        `국민연금 기여금 ${amount.toLocaleString()} WLD 납입이 완료되어 국고로 편입되었습니다!`,
      );
      setAccount(data.account);
      setCashBalance((prev) => Math.max(0, prev - amount));
      setContributions((prev) => [
        {
          id: Math.random().toString(),
          amount_wld: amount.toString(),
          note: '국민연금 기여금 납입',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err: any) {
      toast.error(err.message || '기여금 납입 중 오류가 발생했습니다.');
    } finally {
      setContributing(false);
    }
  };

  const handleToggleRetirement = async () => {
    if (!account) return;
    const isCurrentlyReceiving = account.status === 'RETIRED_RECEIVING';
    const confirmMsg = isCurrentlyReceiving
      ? '기초연금 수령을 중단하고 기여금 추가 적립 모드로 전환하시겠습니까?'
      : '은퇴 기초연금 수령을 개시하시겠습니까? 매시간 확정 연금이 지갑으로 평생 자동 입금됩니다.';

    if (!confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/pension/toggle-retire', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '전환 실패');

      toast.success(
        data.status === 'RETIRED_RECEIVING'
          ? '은퇴 기초연금 수령이 개시되었습니다! 매시간 자동 입금됩니다.'
          : '기여금 추가 적립 모드로 정상 전환되었습니다.',
      );
      setAccount(data);
    } catch (err: any) {
      toast.error(err.message || '상태 전환에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLiquidate = async () => {
    if (!account) return;
    const principal = Number(account.accumulated_contribution_wld);
    const refund = Math.floor(principal * 0.95);
    const welfare = principal - refund;

    if (
      !confirm(
        `[중도 해지 경고]\n적립된 연금 원금의 95%인 ${refund.toLocaleString()} WLD가 지갑으로 즉시 환급되며, 5%(${welfare.toLocaleString()} WLD)는 국가 사회복지기금(VAULT_WELFARE)으로 귀속됩니다.\n\n정말 해지하시겠습니까?`,
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/pension/liquidate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '해지 실패');

      toast.success(`중도 해지 완료: ${Number(data.refundAmountWld).toLocaleString()} WLD가 지갑으로 환급되었습니다.`);
      setAccount(data.account);
      setCashBalance((prev) => prev + Number(data.refundAmountWld));
    } catch (err: any) {
      toast.error(err.message || '해지 처리 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const currentTier = getTierInfo(account?.tier || 'TIER_1_YOUTH');
  const accumulated = Number(account?.accumulated_contribution_wld || 0);
  const hourlyPayout = Math.max(1, Math.floor((accumulated * (account?.hourly_payout_rate_bps || 8)) / 10000));
  const dailyPayout = hourlyPayout * 24;
  const monthlyPayout = dailyPayout * 30;

  // 시뮬레이터 계산
  const simHourly = Math.max(1, Math.floor((simAmount * 9) / 10000));
  const simDaily = simHourly * 24;
  const simMonthly = simDaily * 30;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 상단 헤더 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
              국가 국민연금공단 (National Pension Service)
            </h1>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
              NPS 복리 적립 기금
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            국민(유저)의 자발적 기여금으로 국고를 든든히 확충하고, 은퇴 후 평생 매시간 확정 기초연금을 보장받는 국가 복지 금융 시스템입니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-mono">
            중앙 국고 100% 지급보증 (AAA)
          </Badge>
        </div>
      </div>

      {/* 대국민 기금 운용 현황 배너 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/60 p-4 bg-card/60 backdrop-blur">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Coins className="h-3.5 w-3.5 text-emerald-400" />
            총 기금 운용자산 (AUM)
          </div>
          <div className="text-xl font-bold mt-1 text-foreground">
            {groupDigits(overview.totalAumWld)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 p-4 bg-card/60 backdrop-blur">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-blue-400" />
            가입 국민 / 은퇴 수령자
          </div>
          <div className="text-xl font-bold mt-1 text-foreground">
            {overview.totalSubscribersCount.toLocaleString()}명
            <span className="text-xs font-normal text-emerald-400 ml-1.5">
              (은퇴 {overview.totalRetiredReceiversCount}명)
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 p-4 bg-card/60 backdrop-blur">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5 text-violet-400" />
            기준 연간 기초연금율
          </div>
          <div className="text-xl font-bold mt-1 text-foreground">
            {overview.benchmarkAnnualPayoutRate}
            <span className="text-xs font-normal text-muted-foreground ml-1">(연 7~10%)</span>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 p-4 bg-card/60 backdrop-blur">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            누적 지급 기초연금
          </div>
          <div className="text-xl font-bold mt-1 text-foreground">
            {groupDigits(overview.totalPensionPaidWld)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
          </div>
        </div>
      </div>

      {/* 내 연금 계좌 증서 및 기여금 납입 허브 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 내 연금 계좌 요약 (좌측 7열) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/60 bg-gradient-to-br from-card/80 to-muted/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={currentTier.color}>
                  {currentTier.name}
                </Badge>
                <Badge
                  variant={account?.status === 'RETIRED_RECEIVING' ? 'default' : 'secondary'}
                  className={
                    account?.status === 'RETIRED_RECEIVING'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                      : ''
                  }
                >
                  {account?.status === 'RETIRED_RECEIVING' ? '🟢 평생 기초연금 수령 중' : '🔵 기여금 적립 중'}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold mt-2">
                나의 국민연금 적립 증서
              </CardTitle>
              <CardDescription>
                중앙 국고(VAULT_MAIN)와 연동되어 국부펀드의 복리 운용 레버리지로 보증되는 평생 공적 연금입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-background/50 border border-border/50">
                <div>
                  <div className="text-xs text-muted-foreground">누적 적립 기여금</div>
                  <div className="text-lg font-bold text-foreground mt-0.5">
                    {groupDigits(account?.accumulated_contribution_wld || '0')}{' '}
                    <span className="text-xs font-normal text-muted-foreground">WLD</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">시간당 예상 연금</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    +{hourlyPayout.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-muted-foreground">WLD/h</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">누적 수령 총액</div>
                  <div className="text-lg font-bold text-blue-400 mt-0.5">
                    {groupDigits(account?.total_payout_received_wld || '0')}{' '}
                    <span className="text-xs font-normal text-muted-foreground">WLD</span>
                  </div>
                </div>
              </div>

              {/* 수령 예상액 티커 */}
              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-xs flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  은퇴 수령 시 환산 연금액:
                </span>
                <span className="font-semibold text-foreground">
                  하루 약 <span className="text-emerald-400">+{dailyPayout.toLocaleString()} WLD</span> · 
                  한 달 약 <span className="text-emerald-400">+{monthlyPayout.toLocaleString()} WLD</span>
                </span>
              </div>

              {/* 은퇴 수령 개시 및 중도 해지 버튼 */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <Button
                  onClick={handleToggleRetirement}
                  disabled={actionLoading || accumulated < 1000}
                  className={`flex-1 font-semibold ${
                    account?.status === 'RETIRED_RECEIVING'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {account?.status === 'RETIRED_RECEIVING' ? (
                    <>
                      <Clock className="h-4 w-4 mr-1.5" />
                      연금 수령 일시정지 (적립 모드로 전환)
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      평생 기초연금 수령 개시하기
                    </>
                  )}
                </Button>

                {accumulated > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLiquidate}
                    disabled={actionLoading}
                    className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1" />
                    중도 해지 (95% 환급)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 연금 기여금 납입 허브 (우측 5열) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-400" />
                국민연금 기여금 납입하기
              </CardTitle>
              <CardDescription>
                지갑에서 기여금을 납입하여 연금 적립액과 평생 연금율을 높이세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>내 지갑 가용 잔액:</span>
                <span className="font-mono font-semibold text-foreground">
                  {cashBalance.toLocaleString()} WLD
                </span>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="number"
                    min={1000}
                    step={1000}
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    className="font-mono pr-12 text-base"
                    placeholder="납입할 금액 입력 (최소 1,000 WLD)"
                  />
                  <div className="absolute right-3 top-2.5 text-xs text-muted-foreground font-mono">
                    WLD
                  </div>
                </div>

                {/* 퀵 프리셋 버튼 */}
                <div className="grid grid-cols-4 gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setContributeAmount('10000')}
                  >
                    +1만
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setContributeAmount('50000')}
                  >
                    +5만
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setContributeAmount('100000')}
                  >
                    +10만
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setContributeAmount(cashBalance.toString())}
                  >
                    전액
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleContribute}
                disabled={contributing || !isLoggedIn}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-10"
              >
                {contributing ? '납입 처리 중...' : '국민연금 기여금 즉시 납입'}
              </Button>

              <div className="p-2.5 rounded bg-muted/30 border border-border/40 text-[11px] text-muted-foreground space-y-1">
                <p>• 납입된 금액은 중앙 국고(VAULT_MAIN)로 편입되어 국가 국부펀드로 복리 운용됩니다.</p>
                <p>• 은퇴 시 매시간 확정 기초연금이 평생 동안 자동으로 개인 지갑에 입금됩니다.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 탭: 모의 연금 계산기 & 납입/수령 내역 */}
      <Tabs defaultValue="simulator" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border/50">
          <TabsTrigger value="simulator" className="gap-1.5">
            <Calculator className="h-4 w-4" />
            예상 기초연금 시뮬레이터
          </TabsTrigger>
          <TabsTrigger value="contributions" className="gap-1.5">
            <History className="h-4 w-4" />
            내 기여금 납입 이력 ({contributions.length})
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-1.5">
            <Clock className="h-4 w-4" />
            기초연금 수령 내역 ({payouts.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. 시뮬레이터 탭 */}
        <TabsContent value="simulator" className="space-y-4">
          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="h-5 w-5 text-emerald-400" />
                국민연금 은퇴 수령액 모의 시뮬레이터
              </CardTitle>
              <CardDescription>
                원하는 목표 적립금을 설정하고 은퇴 후 평생 수령할 수 있는 시간당/월간 연금액을 미리 계산해 보세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2 max-w-md">
                <label className="text-xs font-medium text-muted-foreground">목표 누적 적립액</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step={10000}
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="font-mono"
                  />
                  <div className="flex items-center text-xs font-mono text-muted-foreground">WLD</div>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[50000, 100000, 500000, 1000000, 5000000].map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setSimAmount(val)}
                    >
                      {val >= 1000000 ? `${val / 10000}만` : `${val / 10000}만`}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="rounded-xl border border-border/70 p-4 bg-muted/20">
                  <div className="text-xs text-muted-foreground">시간당 확정 수령액</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    +{simHourly.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-muted-foreground">WLD</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">24시간 연속 입금</div>
                </div>
                <div className="rounded-xl border border-border/70 p-4 bg-muted/20">
                  <div className="text-xs text-muted-foreground">하루(24h) 수령액</div>
                  <div className="text-2xl font-bold text-blue-400 mt-1">
                    +{simDaily.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-muted-foreground">WLD</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">일일 정기 복리</div>
                </div>
                <div className="rounded-xl border border-border/70 p-4 bg-muted/20">
                  <div className="text-xs text-muted-foreground">한 달(30일) 수령액</div>
                  <div className="text-2xl font-bold text-violet-400 mt-1">
                    +{simMonthly.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-muted-foreground">WLD</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">월 환산 평생 연금</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. 기여금 납입 이력 */}
        <TabsContent value="contributions">
          <Card className="border-border/60 bg-card/60">
            <CardContent className="pt-6">
              {contributions.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  아직 기여금 납입 내역이 없습니다.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>납입 일시</TableHead>
                      <TableHead>납입 금액</TableHead>
                      <TableHead>비고</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-400">
                          +{Number(c.amount_wld).toLocaleString()} WLD
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {c.note}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. 기초연금 수령 이력 */}
        <TabsContent value="payouts">
          <Card className="border-border/60 bg-card/60">
            <CardContent className="pt-6">
              {payouts.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  아직 기초연금 수령 내역이 없습니다.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>수령 일시</TableHead>
                      <TableHead>수령 연금액</TableHead>
                      <TableHead>당시 적립 원금</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-400">
                          +{Number(p.payout_amount_wld).toLocaleString()} WLD
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {Number(p.snapshot_accumulated_wld).toLocaleString()} WLD
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
