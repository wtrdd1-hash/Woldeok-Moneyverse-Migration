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
    reinvestment_ratio_pct?: number;
    max_investment_ratio_pct?: number;
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
  const [savingConfig, setSavingConfig] = useState(false);

  // 국고 자금 안전 보존 및 투자 거버넌스 튜닝 상태
  const [isEnabled, setIsEnabled] = useState<boolean>(initialConfig?.is_enabled ?? true);
  const [reinvestRatio, setReinvestRatio] = useState<number>(initialConfig?.reinvestment_ratio_pct ?? 15);
  const [maxInvestCap, setMaxInvestCap] = useState<number>(initialConfig?.max_investment_ratio_pct ?? 20);
  const [safeReserve, setSafeReserve] = useState<string>(initialConfig?.safe_reserve_wld || '25000000');
  const [maxSingle, setMaxSingle] = useState<string>(initialConfig?.max_single_investment_wld || '10000000');

  const totalAum = portfolios.reduce(
    (acc, p) => acc + Number(p.current_valuation_wld || 0),
    0,
  );
  const totalProfit = portfolios.reduce(
    (acc, p) => acc + Number(p.unrealized_pnl_wld || 0),
    0,
  );

  async function handleSaveGovernanceConfig() {
    setSavingConfig(true);
    try {
      const res = await fetch('/api/admin/treasury/swf', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          is_enabled: isEnabled,
          reinvestment_ratio_pct: Number(reinvestRatio),
          max_investment_ratio_pct: Number(maxInvestCap),
          safe_reserve_wld: safeReserve,
          max_single_investment_wld: maxSingle,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('국고 자금 투자 비율 및 안전 보존 정책이 저장되었습니다!', {
          description: `투자비율 ${reinvestRatio}% / 최대상한 ${maxInvestCap}% / 국고보존금 ${Number(safeReserve).toLocaleString()} WLD`,
        });
      } else {
        const errorMsg = data.error || data.detail || '설정 저장 중 오류가 발생했습니다.';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('네트워크 통신 중 오류가 발생했습니다.');
    } finally {
      setSavingConfig(false);
    }
  }

  async function handleTriggerRebalance() {
    setRebalancing(true);
    try {
      const res = await fetch('/api/admin/treasury/swf', {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.executed) {
        toast.success('국고 복리 성장 및 자율 리밸런싱이 집행되었습니다!', {
          description: `총 AUM: ${Number(data.totalAumWld || 0).toLocaleString()} WLD (세수 +${Number(data.taxCollectedWld || 0).toLocaleString()} WLD, 수익 실현 +${Number(data.harvestedWld || 0).toLocaleString()} WLD, 재투자 ${Number(data.reinvestedWld || 0).toLocaleString()} WLD)`,
        });
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

  const floorReserve = Number(safeReserve || 25000000);
  const treasuryPreserveRatio = Math.max(0, 100 - reinvestRatio);

  return (
    <div className="space-y-6">
      {/* 1. 관리자 전용 국고 자금 안전 보존 및 투자 비율 정밀 조절 카드 */}
      <Card className="border border-blue-500/30 bg-slate-900/95 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
        <CardHeader className="pb-4 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <CardTitle className="text-lg font-bold tracking-tight text-white">
                  국고 자금 안전 보존 & 투자 비율 정밀 거버넌스 (Treasury Capital Governance)
                </CardTitle>
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs">
                  국고 시스템 우선 보호
                </Badge>
              </div>
              <CardDescription className="text-slate-400 mt-1 text-xs leading-relaxed">
                비상 완충(VAULT_EMERGENCY), 공공 인프라(VAULT_INFRA), 통화안정 지준금(VAULT_RESERVE) 등 국가 필수 시스템에 국고 대부분을 상시 유보하고, 적정 비율만 안전하게 투자하도록 통제합니다.
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={handleSaveGovernanceConfig}
              disabled={savingConfig}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md active:scale-95 transition-all"
            >
              {savingConfig ? '저장 중...' : '💾 정책 설정 저장'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* 실시간 국고 안전 보존 vs 투자 비율 시각화 게이지 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>🛡️ 국고 금고 안전 보존:</span>
                <strong className="text-blue-400 font-mono text-sm">{treasuryPreserveRatio}%</strong>
              </span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>📈 국부펀드 투자 허용:</span>
                <strong className="text-amber-400 font-mono text-sm">{reinvestRatio}%</strong>
              </span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-950 overflow-hidden flex p-0.5 border border-slate-700">
              <div
                style={{ width: `${treasuryPreserveRatio}%` }}
                className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-l-full transition-all duration-300"
              />
              <div
                style={{ width: `${reinvestRatio}%` }}
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-r-full transition-all duration-300"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>✓ 국가 시스템 필수 운영자금 (비상금고 / 인프라 / 지준금)</span>
              <span>최대 상한 {maxInvestCap}% 초과 시 신규 투자 자동 동결</span>
            </div>
          </div>

          {/* 거버넌스 조절 3대 입력 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 슬라이더 1: 잉여금 투자 허용 비율 */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-200">
                  초과 잉여금 투자 비율
                </label>
                <span className="font-mono text-base font-bold text-amber-400">
                  {reinvestRatio}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={reinvestRatio}
                onChange={(e) => setReinvestRatio(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (완전 동결)</span>
                <span>권장 10~15%</span>
                <span>50% (상한)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                초과 세수 중 {reinvestRatio}%만 분산 투자하고, 나머지 {treasuryPreserveRatio}%는 국고에 영구 축적합니다.
              </p>
            </div>

            {/* 슬라이더 2: 국고 총자산 대비 최대 투자 상한 */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-200">
                  국고 총액 대비 최대 투자 상한
                </label>
                <span className="font-mono text-base font-bold text-blue-400">
                  {maxInvestCap}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={maxInvestCap}
                onChange={(e) => setMaxInvestCap(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>5% (초보수적)</span>
                <span>권장 20%</span>
                <span>30% (한도)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                국부펀드 총 AUM이 국고 총액의 {maxInvestCap}%를 넘으면 신규 매수를 전면 중단합니다.
              </p>
            </div>

            {/* 인풋 3: 최소 안전 국고 보존 바닥 */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                최소 안전 국고 보존액 (Floor)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={safeReserve}
                  onChange={(e) => setSafeReserve(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="25000000"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">WLD</span>
              </div>
              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSafeReserve('25000000')}
                  className="px-2 py-0.5 rounded bg-slate-700/60 text-[10px] text-slate-300 hover:bg-slate-700"
                >
                  2,500만
                </button>
                <button
                  type="button"
                  onClick={() => setSafeReserve('30000000')}
                  className="px-2 py-0.5 rounded bg-slate-700/60 text-[10px] text-slate-300 hover:bg-slate-700"
                >
                  3,000만
                </button>
                <button
                  type="button"
                  onClick={() => setSafeReserve('50000000')}
                  className="px-2 py-0.5 rounded bg-slate-700/60 text-[10px] text-slate-300 hover:bg-slate-700"
                >
                  5,000만
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                이 금액 이하의 국고는 어떠한 경우에도 투자하지 않고 금고에 상시 보존합니다.
              </p>
            </div>
          </div>

          {/* 긴급 킬스위치 토글 바 */}
          <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-semibold text-slate-200">
                자율 국부펀드(ASWF) 투자 엔진 상태: {isEnabled ? '정상 가동 중' : '긴급 투자 동결 (0% 완전 중단)'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isEnabled ? 'destructive' : 'default'}
                onClick={() => setIsEnabled(!isEnabled)}
                className="text-xs h-8"
              >
                {isEnabled ? '🛑 투자 즉시 긴급 동결 (0%)' : '▶️ 정상 가동 재개'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 기존 국부펀드 자산 및 포트폴리오 관제 패널 */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 text-white shadow-xl">
        <CardHeader className="pb-4 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📈</span>
                <CardTitle className="text-lg font-bold tracking-tight text-white">
                  국고 복리 성장 국부펀드 (ASWF) 포트폴리오
                </CardTitle>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                  {isEnabled ? '자율 구동 중 (1시간 주기)' : '투자 일시 동결됨'}
                </Badge>
              </div>
              <CardDescription className="text-slate-400 mt-1 text-xs">
                국고 안전 바닥을 보존하며 가상 우량 기업 법인세 자동 징수 및 분산 투자 복리 성장으로 총자산(AUM)을 증식합니다.
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
                설정 원금 이하 절대 안전 보존
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
              <div style={{ width: '60%' }} className="bg-blue-500 h-full" />
              <div style={{ width: '30%' }} className="bg-amber-500 h-full" />
              <div style={{ width: '10%' }} className="bg-emerald-500 h-full" />
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
    </div>
  );
}
