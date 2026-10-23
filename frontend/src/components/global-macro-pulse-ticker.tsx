'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export interface MacroIndicatorData {
  readonly id: string;
  readonly name: string;
  readonly nameEn: string;
  readonly value: number;
  readonly unit: string;
  readonly changeRate: number;
  readonly description: string;
  readonly descriptionEn: string;
  readonly educationalTip: string;
  readonly educationalTipEn: string;
}

export interface EconomicCalendarEvent {
  readonly id: string;
  readonly title: string;
  readonly titleEn: string;
  readonly scheduledDate: string;
  readonly scheduledTime: string;
  readonly dDay: number;
  readonly importance: 'HIGH' | 'MEDIUM' | 'LOW';
  readonly country: 'KR' | 'US' | 'EU';
  readonly previousValue: string;
  readonly forecastValue: string;
  readonly analysisKo: string;
  readonly analysisEn: string;
  readonly marketImpactTipKo: string;
  readonly marketImpactTipEn: string;
}

export interface MacroPulseData {
  readonly updatedAt: string;
  readonly nextUpdateAt: string;
  readonly domestic: readonly MacroIndicatorData[];
  readonly global: readonly MacroIndicatorData[];
  readonly exchangeRates: readonly {
    readonly code: string;
    readonly name: string;
    readonly symbol: string;
    readonly ratePerWld: number;
    readonly formatted: string;
  }[];
  readonly economicCalendar?: readonly EconomicCalendarEvent[];
  readonly marketSummary: {
    readonly sentiment: 'RISK_ON' | 'NEUTRAL' | 'RISK_OFF';
    readonly summaryKo: string;
    readonly summaryEn: string;
    readonly actionTipKo: string;
    readonly actionTipEn: string;
  };
}

const FALLBACK_PULSE: MacroPulseData = {
  updatedAt: new Date().toISOString(),
  nextUpdateAt: new Date(Date.now() + 600000).toISOString(),
  domestic: [
    {
      id: 'bok_rate',
      name: '한국은행 기준금리',
      nameEn: 'BOK Base Rate',
      value: 3.25,
      unit: '%',
      changeRate: 0,
      description: '한국은행 금융통화위원회가 결정하는 정책 기준금리',
      descriptionEn: 'Central Bank Policy Rate',
      educationalTip: '기준금리가 오르면 저축 이자가 늘고 주식 시장 유동성은 줄어듭니다.',
      educationalTipEn: 'Higher rates boost bank interest while curbing equity liquidity.',
    },
    {
      id: 'kospi',
      name: 'KOSPI 코스피',
      nameEn: 'KOSPI Index',
      value: 2642.8,
      unit: 'pt',
      changeRate: 0.45,
      description: '대한민국 유가증권시장 대표 종합주가지수',
      descriptionEn: 'Korea Benchmark Index',
      educationalTip: '반도체와 2차전지 등 수출 대형주 비중이 높아 글로벌 경기 및 환율에 민감합니다.',
      educationalTipEn: 'Sensitive to FX swings due to heavy semiconductor exports.',
    },
    {
      id: 'usd_krw',
      name: '원/달러 환율',
      nameEn: 'USD/KRW',
      value: 1382.4,
      unit: '원',
      changeRate: 0.12,
      description: '1 미국 달러당 원화 교환 비율',
      descriptionEn: 'Exchange Rate',
      educationalTip: '환율 상승 시 수출주의 실적은 개선되지만 수입 원자재 가격이 올라 물가 부담이 커집니다.',
      educationalTipEn: 'Boosts export margins but imports inflation pressure.',
    },
  ],
  global: [
    {
      id: 'fed_funds',
      name: '미국 연준 기준금리',
      nameEn: 'Fed Funds Rate',
      value: 4.75,
      unit: '%',
      changeRate: 0,
      description: '미국 연방준비제도(Fed)의 목표 정책금리',
      descriptionEn: 'US Target Rate',
      educationalTip: '글로벌 자산 가격의 할인율이자 전 세계 투자 자금 흐름을 결정하는 핵심 기준입니다.',
      educationalTipEn: 'Primary benchmark discount rate for global capital flows.',
    },
    {
      id: 'sp500',
      name: 'S&P 500',
      nameEn: 'S&P 500 Index',
      value: 5784.5,
      unit: 'pt',
      changeRate: 0.38,
      description: '미국 시가총액 상위 500대 우량 상장기업 지수',
      descriptionEn: 'US Large Cap Index',
      educationalTip: '장기 적립식 복리 투자의 대표 벤치마크로 미국 경제 전체의 성장성을 대변합니다.',
      educationalTipEn: 'Gold standard for long-term compounding index portfolios.',
    },
    {
      id: 'nasdaq',
      name: 'NASDAQ 나스닥',
      nameEn: 'NASDAQ Composite',
      value: 18260.2,
      unit: 'pt',
      changeRate: 0.72,
      description: '글로벌 빅테크 및 기술 성장주 중심 지수',
      descriptionEn: 'Tech Innovation Index',
      educationalTip: '금리 하락기나 AI 신기술 모멘텀 시기에 가장 탄력적으로 상승하는 성장형 지수입니다.',
      educationalTipEn: 'Outperforms during rate cuts due to lower discount rates.',
    },
  ],
  exchangeRates: [
    { code: 'KRW', name: '원화', symbol: '₩', ratePerWld: 100, formatted: '100원' },
    { code: 'USD', name: '달러', symbol: '$', ratePerWld: 0.0723, formatted: '$0.0723' },
    { code: 'JPY', name: '엔화', symbol: '¥', ratePerWld: 11.08, formatted: '¥11.08' },
  ],
  economicCalendar: [
    {
      id: 'us-cpi',
      title: '미국 9월 소비자물가지수 (CPI)',
      titleEn: 'US September Consumer Price Index (CPI)',
      scheduledDate: '2026-10-08',
      scheduledTime: '21:30 KST',
      dDay: 1,
      importance: 'HIGH',
      country: 'US',
      previousValue: '2.5%',
      forecastValue: '2.3%',
      analysisKo: '물가 둔화세가 확고해지면 미 연준의 금리 인하 여력이 넓어져 주식 시장에 강력한 호재가 됩니다.',
      analysisEn: 'Disinflation confirmation will boost Fed easing bets, favoring tech growth equities.',
      marketImpactTipKo: '예측치(2.3%) 하회 시 ➡️ 기술주 급등, 달러 약세 / 예측치 상회 시 ➡️ 금리 재반등 및 변동성 확대',
      marketImpactTipEn: 'Below forecast ➡️ Stock rally, weaker USD / Above forecast ➡️ Yield rise, risk-off',
    },
    {
      id: 'fomc-rate',
      title: '미국 연준 FOMC 기준금리 결정',
      titleEn: 'FOMC Interest Rate Decision',
      scheduledDate: '2026-10-10',
      scheduledTime: '03:00 KST',
      dDay: 3,
      importance: 'HIGH',
      country: 'US',
      previousValue: '5.00%',
      forecastValue: '4.75% (-25bp)',
      analysisKo: '전 세계 금융 유동성의 분기점입니다. 파월 의장의 성명서 어조가 주식과 가상자산 변동성을 주도합니다.',
      analysisEn: 'Pivotal for global liquidity. Powell press conference will dictate crypto & stock volatility.',
      marketImpactTipKo: '인하 폭(25bp)은 선반영되어 있으므로 향후 연내 추가 인하 경로(점도표)에 시장이 즉각 반응합니다.',
      marketImpactTipEn: '25bp cut is priced in. Forward guidance will drive subsequent equity movements.',
    },
    {
      id: 'us-nfp',
      title: '미국 비농업 고용보고서 (NFP)',
      titleEn: 'US Non-Farm Payrolls',
      scheduledDate: '2026-10-12',
      scheduledTime: '21:30 KST',
      dDay: 5,
      importance: 'HIGH',
      country: 'US',
      previousValue: '142K',
      forecastValue: '150K',
      analysisKo: '고용 지표의 완만한 둔화는 경기 침체 없는 연착륙(Soft Landing) 시나리오의 핵심 검증대입니다.',
      analysisEn: 'Measures labor cooling to gauge whether US economy achieves a soft landing.',
      marketImpactTipKo: '적정 수준의 고용 증가와 임금 안정은 시장이 가장 선호하는 골디락스 장세를 형성합니다.',
      marketImpactTipEn: 'Moderate job adds with cooling wages trigger ideal Goldilocks conditions.',
    },
    {
      id: 'bok-rate',
      title: '한국은행 금통위 기준금리 결정',
      titleEn: 'Bank of Korea Rate Decision',
      scheduledDate: '2026-10-14',
      scheduledTime: '10:00 KST',
      dDay: 7,
      importance: 'HIGH',
      country: 'KR',
      previousValue: '3.50%',
      forecastValue: '3.25% (-25bp 피벗)',
      analysisKo: '물가 안정과 가계부채 추이를 검토하며 통화 긴축을 마무리하고 완화로 전환하는 첫 분기점입니다.',
      analysisEn: 'Evaluating real estate and household debt, potential first easing cycle in 3+ years.',
      marketImpactTipKo: '금리 인하 시작 시 예금 이율이 하락하며 시중 자금이 가상주식과 위험자산으로 이동할 유인이 커집니다.',
      marketImpactTipEn: 'Rate cut lowers deposit rates, spurring capital migration into risk assets.',
    },
  ],
  marketSummary: {
    sentiment: 'RISK_ON',
    summaryKo: '글로벌 유동성 완화 기대감이 확산되며 기술 성장주 선호가 이어지고 있습니다.',
    summaryEn: 'Risk-on sentiment supported by tech resilience.',
    actionTipKo: '💡 실전 팁: 한미 기준금리 격차와 환율 추이를 종합하여 분산 포트폴리오를 유지하세요.',
    actionTipEn: '💡 Pro Tip: The rate spread explains cross-border asset flows.',
  },
};

export function GlobalMacroPulseTicker() {
  const [data, setData] = useState<MacroPulseData>(FALLBACK_PULSE);
  const [selectedItem, setSelectedItem] = useState<MacroIndicatorData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EconomicCalendarEvent | null>(null);
  const [filterCountry, setFilterCountry] = useState<'ALL' | 'US' | 'KR' | 'EU'>('ALL');
  const [highImpactOnly, setHighImpactOnly] = useState(false);

  useEffect(() => {
    fetch('/app-api/v1/economy/macro-pulse')
      .then((res) => (res.ok ? res.json() : FALLBACK_PULSE))
      .then((json) => {
        if (json?.domestic && json?.global) {
          setData(json);
        }
      })
      .catch(() => {});
  }, []);

  const allIndicators = [...data.domestic, ...data.global];
  const calendarEvents = data.economicCalendar || FALLBACK_PULSE.economicCalendar || [];
  const filteredEvents = calendarEvents.filter((evt) => {
    if (filterCountry !== 'ALL' && evt.country !== filterCountry) return false;
    if (highImpactOnly && evt.importance !== 'HIGH') return false;
    return true;
  });

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0d131f] p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* 1. 상단 상태 헤더 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <Globe className="size-3.5 animate-spin" style={{ animationDuration: '14s' }} />
            <span>실시간 거시경제 지표 (Macro Pulse)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">10분 자동 갱신</span>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-slate-400 font-medium">시장 심리:</span>
          <Badge
            variant="outline"
            className={
              data.marketSummary.sentiment === 'RISK_ON'
                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40 font-bold px-2.5 py-0.5'
                : 'border-amber-500/40 text-amber-400 bg-amber-950/40 font-bold px-2.5 py-0.5'
            }
          >
            {data.marketSummary.sentiment === 'RISK_ON' ? '📈 위험 선호 (Risk-On)' : '🛡️ 방어적 분산 (Risk-Off)'}
          </Badge>
          <span className="text-[11px] text-slate-500 hidden md:inline">· 지표를 클릭하면 실전 경제 해설이 열립니다</span>
        </div>
      </div>

      {/* 2. 🔥 핵심 개선: 수치 쪼개짐 없는 핀테크 표준 6대 지표 카드 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {allIndicators.map((item) => {
          const isUp = item.changeRate > 0;
          const isDown = item.changeRate < 0;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              type="button"
              className="group flex flex-col justify-between rounded-xl bg-slate-900/90 p-3 text-left border border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-800/90 transition-all cursor-pointer min-h-[92px] active:scale-[0.98]"
            >
              {/* 상단: 지표명 및 안내 아이콘 */}
              <div className="flex items-center justify-between w-full gap-1">
                <span className="text-xs text-slate-300 font-bold truncate group-hover:text-emerald-300 transition-colors">
                  {item.name}
                </span>
                <HelpCircle className="size-3 text-slate-500 group-hover:text-emerald-400 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* 중단: 큼직하고 안정적인 모노스페이스 수치 (독립 행으로 줄바꿈 쪼개짐 원천 차단) */}
              <div className="my-1.5 min-w-0">
                <div className="font-mono text-sm sm:text-base font-black text-slate-100 tracking-tight tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.value.toLocaleString()}
                  <span className="text-xs font-semibold text-slate-400 ml-1">{item.unit}</span>
                </div>
              </div>

              {/* 하단: 등락률 칩 */}
              <div className="flex items-center">
                {item.changeRate !== 0 ? (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isUp
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    <span>{isUp ? '+' : ''}{item.changeRate}%</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-mono font-medium text-slate-400 px-1 py-0.5">
                    보합 (0.0%)
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. 국내외 거시경제 캘린더 D-Day 스트립 */}
      {calendarEvents.length > 0 && (
        <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Calendar className="size-3.5 text-amber-400" />
              <span>주요 거시경제 캘린더 D-Day (FOMC · CPI · 금통위)</span>
            </div>

            {/* 필터 바 */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterCountry('ALL')}
                className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  filterCountry === 'ALL'
                    ? 'bg-slate-700 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => setFilterCountry('US')}
                className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  filterCountry === 'US'
                    ? 'bg-blue-600 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                미국
              </button>
              <button
                type="button"
                onClick={() => setFilterCountry('KR')}
                className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  filterCountry === 'KR'
                    ? 'bg-rose-600 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                한국
              </button>
              <button
                type="button"
                onClick={() => setFilterCountry('EU')}
                className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  filterCountry === 'EU'
                    ? 'bg-amber-600 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                유럽
              </button>
              <button
                type="button"
                onClick={() => setHighImpactOnly(!highImpactOnly)}
                className={`ml-1 px-2 py-0.5 rounded-lg border cursor-pointer transition-colors ${
                  highImpactOnly
                    ? 'border-rose-500 bg-rose-950/50 text-rose-300 font-bold'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🔥 High만
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full max-w-full min-w-0 pb-1 scrollbar-none">
            {filteredEvents.map((evt) => {
              const isHigh = evt.importance === 'HIGH';

              let dDayLabel = evt.dDay === 0 ? 'D-Day 오늘' : `D-${evt.dDay}`;
              let isPast = false;
              let isToday = false;
              try {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const target = new Date(evt.scheduledDate);
                target.setHours(0, 0, 0, 0);
                const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) {
                  dDayLabel = '발표 완료';
                  isPast = true;
                } else if (diffDays === 0) {
                  dDayLabel = 'D-Day 오늘';
                  isToday = true;
                } else {
                  dDayLabel = `D-${diffDays}`;
                }
              } catch {
                // ignore
              }

              return (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => setSelectedEvent(evt)}
                  className="shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left cursor-pointer group min-w-[200px]"
                >
                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-mono font-black shrink-0 ${
                      isPast
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : isToday
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                        : isHigh
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {dDayLabel}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                      {evt.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      예측: <strong className="text-slate-300">{evt.forecastValue}</strong> (이전: {evt.previousValue})
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. 실전 금융 지식 해설 팝업 모달 */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-md border-slate-800 bg-[#0f172a] text-slate-100 rounded-2xl p-6">
          {selectedItem && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs">
                    실전 경제 백과사전
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">{selectedItem.nameEn}</span>
                </div>
                <DialogTitle className="text-lg font-bold text-slate-100 mt-1">
                  {selectedItem.name} ({selectedItem.value}{selectedItem.unit})
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300">
                  {selectedItem.description}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <BookOpen className="size-4" />
                  <span>실전 투자 및 경제 공부 팁</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedItem.educationalTip}
                </p>
                <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                  {selectedItem.educationalTipEn}
                </p>
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                월덕 머니버스의 가상 주식 및 금융 시뮬레이션은 실제 거시경제 논리를 그대로 반영합니다.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 5. 경제 캘린더 이벤트 상세 분석 팝업 다이얼로그 */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-lg border-slate-800 bg-[#0f172a] text-slate-100 rounded-2xl p-6">
          {selectedEvent && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={
                      selectedEvent.importance === 'HIGH'
                        ? 'border-rose-500/40 text-rose-300 bg-rose-950/30 font-bold'
                        : 'border-amber-500/40 text-amber-300 bg-amber-950/30 font-bold'
                    }
                  >
                    {selectedEvent.importance === 'HIGH' ? '🔥 초고위험 영향도 (HIGH)' : '⚡ 시장 변동성 주의 (MEDIUM)'}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {selectedEvent.dDay === 0 ? 'D-Day 오늘' : `D-${selectedEvent.dDay}`}
                  </span>
                </div>
                <DialogTitle className="text-lg font-bold text-slate-100 mt-2">
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 font-mono">
                  {selectedEvent.titleEn} · 예정 일시: {selectedEvent.scheduledDate} {selectedEvent.scheduledTime}
                </DialogDescription>
              </DialogHeader>

              {/* 3열 비교 그리드: 이전치 vs 예측치 vs 발표 결과 */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-400 font-semibold">이전치</span>
                  <span className="block text-sm font-bold font-mono text-slate-200 mt-0.5">
                    {selectedEvent.previousValue}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                  <span className="block text-[10px] text-amber-400 font-semibold">예측치</span>
                  <span className="block text-sm font-bold font-mono text-amber-300 mt-0.5">
                    {selectedEvent.forecastValue}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                  <span className="block text-[10px] text-blue-400 font-semibold">결과</span>
                  <span className="block text-xs font-mono text-blue-300 font-medium mt-1">
                    {selectedEvent.dDay === 0 ? '발표 대기' : '집계 대기'}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <AlertCircle className="size-4 text-amber-400" />
                  <span>이벤트 심층 분석 및 경제적 배경</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedEvent.analysisKo}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <TrendingUp className="size-4" />
                  <span>실전 투자 및 자산 배분 시사점</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedEvent.marketImpactTipKo}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
