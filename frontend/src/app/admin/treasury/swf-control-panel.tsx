'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface SwfPortfolioItem {
  id: string;
  asset_type: string;
  asset_symbol: string;
  asset_name: string;
  quantity: string;
  total_invested_wld: string;
  average_price_wld: string;
  current_valuation_wld: string;
  unrealized_pnl_wld: string;
}

export interface SwfEvent {
  id: string;
  event_type: string;
  amount_wld: string;
  summary: string;
  created_at: string;
}

interface Props {
  initialConfig?: {
    is_enabled: boolean;
    safe_reserve_wld: string;
    max_single_investment_wld: string;
    equity_ratio_pct: number;
    bond_ratio_pct: number;
    dividend_ratio_pct: number;
  };
  initialPortfolios?: SwfPortfolioItem[];
  initialEvents?: SwfEvent[];
}

export function SwfControlPanel({
  initialConfig,
  initialPortfolios = [],
  initialEvents = [],
}: Props) {
  const [portfolios, setPortfolios] = useState<SwfPortfolioItem[]>(initialPortfolios);
  const [events, setEvents] = useState<SwfEvent[]>(initialEvents);
  const [rebalancing, setRebalancing] = useState(false);

  const totalAum = portfolios.reduce(
    (acc, p) => acc + Number(p.current_valuation_wld || 0),
    0,
  );
  const totalProfit = portfolios.reduce(
    (acc, p) => acc + Number(p.unrealized_pnl_wld || 0),
    0,
  );

  async function handleTriggerRebalance() {
    setRebalancing(true);
    try {
      const res = await fetch('/api/admin/treasury/swf', {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.executed) {
        toast.success('국고 잉여 세수 자율 리밸런싱이 집행되었습니다!', {
          description: `총 ${Number(data.investedWld).toLocaleString()} WLD가 시장과 시민에게 재순환되었습니다.`,
        });
        // 최신 데이터 갱신
        const refreshRes = await fetch('/api/admin/treasury/swf');
        if (refreshRes.ok) {
          const refreshed = await refreshRes.json();
          if (refreshed.portfolios) setPortfolios(refreshed.portfolios);
          if (refreshed.events) setEvents(refreshed.events);
        }
      } else {
        toast.info('리밸런싱 조건 미충족 또는 대기 상태', {
          description: data.reason || '안전 준비금 한도 또는 유휴 세수를 확인해 주세요.',
        });
      }
    } catch {
      toast.error('리밸런싱 요청 중 오류가 발생했습니다.');
    } finally {
      setRebalancing(false);
    }
  }

  return (
    <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-background to-background">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500 text-emerald-400">
              국부펀드 (ASWF) 자율 재순환
            </Badge>
            <Badge variant="secondary" className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              1시간 주기 전자동 집행 ON
            </Badge>
          </div>
          <CardTitle className="text-base mt-2">
            국고 잉여 세수 자율 투자 & 시장 재순환 엔진
          </CardTitle>
          <CardDescription>
            노르웨이 GPFG 및 싱가포르 테마섹 벤치마킹: 국고 유휴 잉여금을 WDX 우량주에 분산 투자하고, 수익과 재원을 시민 기본소득 배당으로 환류하여 시중 유동성 고갈을 방지합니다.
          </CardDescription>
        </div>
        <div className="shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={handleTriggerRebalance}
            disabled={rebalancing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            {rebalancing ? '리밸런싱 집행 중...' : '지금 즉시 리밸런싱 집행'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* 지표 서머리 */}
        <div className="grid gap-3 sm:grid-cols-3 bg-muted/20 p-3 rounded-lg border">
          <div>
            <div className="text-xs text-muted-foreground">국부펀드 총 운용자산 (AUM)</div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {totalAum.toLocaleString()} WLD
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              누적 평가 손익: +{totalProfit.toLocaleString()} WLD
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">자산 배분 규격 (Target Ratio)</div>
            <div className="text-sm font-semibold font-mono mt-1 text-foreground">
              주식 50% · 국채 30% · 시민배당 20%
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              100% 재정 이전 (총통화량 변동 없음)
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">최소 안전 지급준비금 한도</div>
            <div className="text-sm font-semibold font-mono mt-1 text-foreground">
              {Number(initialConfig?.safe_reserve_wld || 50000000).toLocaleString()} WLD
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              준비금 초과 잉여 세수만 선별 투자
            </div>
          </div>
        </div>

        {/* 포트폴리오 카드 그리드 */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            🏛️ 국부펀드 보유 WDX 우량주 포트폴리오
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {portfolios.map((p) => {
              const pnl = Number(p.unrealized_pnl_wld || 0);
              const pnlPct =
                Number(p.total_invested_wld || 0) > 0
                  ? ((pnl / Number(p.total_invested_wld)) * 100).toFixed(1)
                  : '0.0';
              return (
                <div
                  key={p.asset_symbol}
                  className="p-2.5 rounded-md border bg-card/60 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {p.asset_symbol}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      +{pnlPct}%
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {p.asset_name}
                  </div>
                  <div className="mt-2 text-right">
                    <div className="text-xs font-mono font-semibold text-foreground">
                      {Number(p.current_valuation_wld).toLocaleString()} WLD
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {Number(p.quantity).toLocaleString()}주 보유
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 최근 재순환 타임라인 이벤트 */}
        {events.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1.5">
              📜 최근 국부펀드 재순환 및 배당 이력
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
              {events.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-1.5 rounded bg-muted/30 border border-muted"
                >
                  <span className="truncate pr-2">{e.summary}</span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {new Date(e.created_at).toLocaleTimeString('ko-KR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
