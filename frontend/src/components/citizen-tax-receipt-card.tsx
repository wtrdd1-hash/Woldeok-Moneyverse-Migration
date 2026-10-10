'use client';

import { useState, useEffect, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import { ShieldCheck, Flame, HeartHandshake, Building2, Vote, CheckCircle2, Receipt } from 'lucide-react';

interface TaxReceiptData {
  user_id: string;
  total_tax_paid_wld: string;
  breakdown: {
    market_tax_wld: string;
    stock_tax_wld: string;
    transfer_tax_wld: string;
  };
  allocated_usage: {
    welfare_40pct_wld: string;
    infra_30pct_wld: string;
    emergency_20pct_wld: string;
    burn_10pct_wld: string;
  };
  total_community_dividend_wld: string;
  evaluated_at: string;
}

export function CitizenTaxReceiptCard() {
  const [data, setData] = useState<TaxReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState<string>('WELFARE');
  const [voteSubmitted, setVoteSubmitted] = useState<boolean>(false);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const now = new Date();
  const currentQuarter = `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;

  useEffect(() => {
    let mounted = true;
    fetch('/api/v1/wallet/tax-receipt')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleVote = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/v1/wallet/governance/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quarter: currentQuarter,
            choice: selectedChoice,
          }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setVoteSubmitted(true);
          setVoteMessage(`${currentQuarter} 분기 예산 지출 우선순위 투표가 성공적으로 국고 회계 감사 원장에 기록되었습니다!`);
        } else {
          setVoteMessage(json.message || '투표 처리에 실패했습니다.');
        }
      } catch {
        setVoteMessage('네트워크 오류가 발생했습니다.');
      }
    });
  };

  if (loading) {
    return (
      <Card className="border shadow-sm animate-pulse">
        <CardHeader className="p-4 sm:p-5">
          <div className="h-5 bg-muted rounded w-1/3 mb-2" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const totalPaid = data?.total_tax_paid_wld ?? '0';
  const breakdown = data?.breakdown ?? { market_tax_wld: '0', stock_tax_wld: '0', transfer_tax_wld: '0' };
  const alloc = data?.allocated_usage ?? { welfare_40pct_wld: '0', infra_30pct_wld: '0', emergency_20pct_wld: '0', burn_10pct_wld: '0' };
  const dividend = data?.total_community_dividend_wld ?? '0';

  return (
    <Card className="border shadow-sm border-primary/20 bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg font-bold">시민 납세 투명성 영수증 (1 WLD 단위 실시간 추적)</CardTitle>
            <Badge className="bg-emerald-600 text-white text-[10px]">헌법적 재정준칙</Badge>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            {data?.evaluated_at ? `정산 기준: ${new Date(data.evaluated_at).toLocaleTimeString('ko-KR')}` : '실시간 집계'}
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          내가 시장, 주식, 거래에서 납부한 세금이 어디에 쓰였는지 4분할 헌법적 재정준칙에 따라 투명하게 공개됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-5">
        {/* 총 납세액 요약 배너 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border bg-background/80 p-3 sm:p-4 shadow-xs">
            <span className="text-xs text-muted-foreground block">내가 납부한 총 세금 실적</span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-primary mt-1">
              {groupDigits(totalPaid)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground flex items-center justify-between">
              <span>거래소: {groupDigits(breakdown.market_tax_wld)} WLD</span>
              <span>주식: {groupDigits(breakdown.stock_tax_wld)} WLD</span>
            </div>
          </div>

          <div className="rounded-lg border bg-background/80 p-3 sm:p-4 shadow-xs sm:col-span-2">
            <span className="text-xs text-muted-foreground block">국고 누적 시민 환원 배당 (Ecosystem Dividend)</span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 mt-1">
              +{groupDigits(dividend)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              국고 세수 잉여금은 헌법적 재정준칙에 따라 매월 1일 자율 안정화 기제를 통해 시민 기본소득으로 전액 환원됩니다.
            </p>
          </div>
        </div>

        {/* 4분할 목적별 귀속 기여액 그리드 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">내 납세액의 4분할 자동 귀속 명세</span>
            <span className="text-[11px] text-muted-foreground">
              {Number(totalPaid) > 0 ? '100% 원자적 분할 적립 완료' : '납세 이력 발생 시 자동 4분할 적립'}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 복지 40% */}
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <HeartHandshake className="h-3.5 w-3.5" /> 복지기금
                </span>
                <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/30">40%</Badge>
              </div>
              <div className="text-base font-bold font-mono text-purple-900 dark:text-purple-100">
                {groupDigits(alloc.welfare_40pct_wld)} <span className="text-[10px] font-normal text-muted-foreground">WLD</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">기본소득 및 안전망 지원</p>
            </div>

            {/* 인프라 30% */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> 공공인프라
                </span>
                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30">30%</Badge>
              </div>
              <div className="text-base font-bold font-mono text-blue-900 dark:text-blue-100">
                {groupDigits(alloc.infra_30pct_wld)} <span className="text-[10px] font-normal text-muted-foreground">WLD</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">서버 및 생태계 보상풀</p>
            </div>

            {/* 비상비축 20% */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> 비상준비금
                </span>
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">20%</Badge>
              </div>
              <div className="text-base font-bold font-mono text-amber-900 dark:text-amber-100">
                {groupDigits(alloc.emergency_20pct_wld)} <span className="text-[10px] font-normal text-muted-foreground">WLD</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">시장 충격 완충 및 정산 방어</p>
            </div>

            {/* 영구소각 10% */}
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" /> 영구소각
                </span>
                <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-500/30">10%</Badge>
              </div>
              <div className="text-base font-bold font-mono text-rose-900 dark:text-rose-100">
                {groupDigits(alloc.burn_10pct_wld)} <span className="text-[10px] font-normal text-muted-foreground">WLD</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">화폐 디플레이션 가치 보존</p>
            </div>
          </div>
        </div>

        {/* 분기별 시민 거버넌스 예산 지출 우선순위 투표 섹션 */}
        <div className="rounded-lg border bg-background/60 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <Vote className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">{currentQuarter} 분기 예산 집행 우선순위 시민 거버넌스 투표</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">1인 1표 직접 민주제</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-colors ${selectedChoice === 'WELFARE' ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'}`}>
              <input
                type="radio"
                name="gov_budget_choice"
                value="WELFARE"
                checked={selectedChoice === 'WELFARE'}
                onChange={() => setSelectedChoice('WELFARE')}
                className="mt-0.5"
              />
              <div>
                <span className="font-semibold block text-foreground">시민 복지 및 기본소득 우선 (Welfare First)</span>
                <span className="text-[11px] text-muted-foreground">국고 잉여금을 시민 기본소득 배당으로 최우선 환원</span>
              </div>
            </label>

            <label className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-colors ${selectedChoice === 'BUYBACK_BURN' ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'}`}>
              <input
                type="radio"
                name="gov_budget_choice"
                value="BUYBACK_BURN"
                checked={selectedChoice === 'BUYBACK_BURN'}
                onChange={() => setSelectedChoice('BUYBACK_BURN')}
                className="mt-0.5"
              />
              <div>
                <span className="font-semibold block text-foreground">룬스케이프형 역매수 영구소각 우선 (Deflation First)</span>
                <span className="text-[11px] text-muted-foreground">시장 덤핑 아이템을 국고가 사들여 소각, 화폐 가치 방어</span>
              </div>
            </label>

            <label className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-colors ${selectedChoice === 'INFRA' ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'}`}>
              <input
                type="radio"
                name="gov_budget_choice"
                value="INFRA"
                checked={selectedChoice === 'INFRA'}
                onChange={() => setSelectedChoice('INFRA')}
                className="mt-0.5"
              />
              <div>
                <span className="font-semibold block text-foreground">공공 인프라 및 보상 풀 확충 (Infra First)</span>
                <span className="text-[11px] text-muted-foreground">서버 고도화 및 커뮤니티 활동가 참여 보상 풀 확대</span>
              </div>
            </label>

            <label className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-colors ${selectedChoice === 'EMERGENCY' ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'}`}>
              <input
                type="radio"
                name="gov_budget_choice"
                value="EMERGENCY"
                checked={selectedChoice === 'EMERGENCY'}
                onChange={() => setSelectedChoice('EMERGENCY')}
                className="mt-0.5"
              />
              <div>
                <span className="font-semibold block text-foreground">비상 준비금 비축 극대화 (Safety First)</span>
                <span className="text-[11px] text-muted-foreground">블랙 스완 사태 대비 주식 정산 및 유동성 방어 준비금 적립</span>
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
            <div className="text-[11px] text-muted-foreground">
              {voteMessage ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {voteMessage}
                </span>
              ) : (
                '투표 결과는 다음 분기 헌법적 재정 배정 비율에 즉시 가중치로 반영됩니다.'
              )}
            </div>
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={handleVote}
              className="w-full sm:w-auto text-xs h-8 px-4 font-semibold"
            >
              {isPending ? '투표 기록 중...' : voteSubmitted ? '투표 변경하기' : '시민 우선순위 투표 제출'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
