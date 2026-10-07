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
    auto_harvest_enabled?: boolean;
    auto_tax_enabled?: boolean;
    auto_growth_yield_bps?: number;
    target_anchor_wld?: string;
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
        toast.success('국고 복리 성장 및 자율 리밸런싱이 집행되었습니다!', {
          description: `총 AUM: ${Number(data.totalAumWld || 0).toLocaleString()} WLD (세수 +${Number(data.taxCollectedWld || 0).toLocaleString()} WLD, 수익 실현 +${Number(data.harvestedWld || 0).toLocaleString()} WLD)`,
        });
        // 최신 데이터 갱신
        const refreshRes = await fetch('/api/admin/treasury/swf');
        if (refreshRes.ok) {
          const refreshed = await refreshRes.json();
          if (refreshed.portfolios) setPortfolios(refreshed.portfolios);
          if (refreshed.events) setEvents(refreshed.events);
        }
      } else {
        toast.info('성장 엔진 평가 완료 (대기 상태)', {
          description: data.reason || '조건을 확인해주세요.',
        });
      }
    } catch {
      toast.error('성장 엔진 집행 요청 중 오류가 발생했습니다.');
    } finally {
      setRebalancing(false);
    }
  }

  const floorReserve = Number(initialConfig?.safe_reserve_wld || 25000000);

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 text-white shadow-xl">
      <CardHeader className="pb-4 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📈</span>
              <CardTitle className="text-lg font-bold tracking-tight text-white">
                국고 2,500만 WLD 보존 & 자율 복리 성장 국부펀드 (ASWF)
              </CardTitle>
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                무인 자율 구동 중 (1시간 주기)
              </Badge>
            </div>
            <CardDescription className="text-slate-400 mt-1 text-xs">
              국고 기초 원금 2,500만 WLD를 영구 보존(Floor)하며, 가상 우량 기업 법인세 자동 징수 및 투자 자산 평가익 복리 재투자로 총자산(AUM)을 우상향 증식합니다.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleTriggerRebalance}
            disabled={rebalancing}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md active:scale-95 transition-all"
          >
            {rebalancing ? '성장 평가 및 집행 중...' : '⚡ 즉시 복리 성장 트리거'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* 주요 지표 3개 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">국부펀드 투자 자산 (AUM)</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {totalAum.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-400">WLD</span>
            </div>
            <div className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1 font-mono">
              <span>▲ 시간당 1.2% 자율 복리 증식 중</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">국고 최소 안전 바닥 (Floor Reserve)</div>
            <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
              {floorReserve.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-400">WLD</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              2,500만 원 절대 원금 영구 보존
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="text-xs text-slate-400 font-medium">누적 운용 평가 손익 (PnL)</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              +{totalProfit.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-400">WLD</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              평가익 30% 국고 회수 환원 · 70% 자산 재투자
            </div>
          </div>
        </div>

        {/* 3대 자산 배분 비중 바 */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-300">
            <span className="font-semibold">헌법적 3대 자산 복리 배분 비중</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span>WDX 주식 60%</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span>국채 예치 30%</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>시민 기본소득 10%</span>
            </div>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-700/60 overflow-hidden flex">
            <div style={{ width: '60%' }} className="bg-blue-500 h-full"></div>
            <div style={{ width: '30%' }} className="bg-amber-500 h-full"></div>
            <div style={{ width: '10%' }} className="bg-emerald-500 h-full"></div>
          </div>
        </div>

        {/* 4대 우량주 보유 포트폴리오 카드 그리드 */}
        <div>
          <div className="text-sm font-semibold text-slate-200 mb-3 flex items-center justify-between">
            <span>🏛️ WDX 4대 대표 섹터 우량주 보유 현황</span>
            <span className="text-xs text-slate-400">정기 영업 이익 및 법인세 국고 자동 납입 중</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {portfolios.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {item.asset_symbol}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700 py-0 px-1.5">
                      우량주
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1 truncate">
                    {item.asset_name}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-700/40 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">보유 수량:</span>
                    <span className="font-mono font-medium text-slate-200">
                      {Number(item.quantity).toLocaleString()}주
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">평가 금액:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {Number(item.current_valuation_wld).toLocaleString()} WLD
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">평가 손익:</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      +{Number(item.unrealized_pnl_wld).toLocaleString()} WLD
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 자율 복리 집행 타임라인 */}
        {events.length > 0 && (
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-300 mb-2">📜 최근 자율 성장 및 투자 집행 이력</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {events.slice(0, 5).map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30 flex items-center justify-between text-xs"
                >
                  <div className="text-slate-300 truncate max-w-[80%]">
                    {ev.summary}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                    {new Date(ev.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
