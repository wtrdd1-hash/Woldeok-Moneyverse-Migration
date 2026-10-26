'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  BookOpen,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useLocale } from '@/components/locale-provider';

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
  readonly dataMode: 'SIMULATED_EDUCATIONAL';
  readonly source: 'INTERNAL_DETERMINISTIC_SCENARIO';
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
  readonly economicCalendar: readonly EconomicCalendarEvent[];
  readonly marketSummary: {
    readonly sentiment: 'RISK_ON' | 'NEUTRAL' | 'RISK_OFF';
    readonly summaryKo: string;
    readonly summaryEn: string;
    readonly actionTipKo: string;
    readonly actionTipEn: string;
  };
}

// The upstream service emits deterministic examples, not a real-market data feed.
// Fail closed if provenance or the shape changes; never synthesize a plausible quote.
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonemptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isIndicator = (value: unknown): boolean =>
  isRecord(value) &&
  ['id', 'name', 'nameEn', 'unit', 'description', 'descriptionEn', 'educationalTip', 'educationalTipEn']
    .every((key) => isNonemptyString(value[key])) &&
  isFiniteNumber(value.value) && isFiniteNumber(value.changeRate);

const isCalendarEvent = (value: unknown): boolean =>
  isRecord(value) &&
  ['id', 'title', 'titleEn', 'scheduledDate', 'scheduledTime', 'previousValue', 'forecastValue',
    'analysisKo', 'analysisEn', 'marketImpactTipKo', 'marketImpactTipEn']
    .every((key) => isNonemptyString(value[key])) &&
  isFiniteNumber(value.dDay) &&
  ['HIGH', 'MEDIUM', 'LOW'].includes(String(value.importance)) &&
  ['KR', 'US', 'EU'].includes(String(value.country));

export function parseMacroPulse(value: unknown): MacroPulseData | null {
  if (!isRecord(value)) return null;
  const summary = isRecord(value.marketSummary) ? value.marketSummary : null;
  if (
      value.dataMode !== 'SIMULATED_EDUCATIONAL' ||
      value.source !== 'INTERNAL_DETERMINISTIC_SCENARIO' ||
      !isNonemptyString(value.updatedAt) ||
      !isNonemptyString(value.nextUpdateAt) ||
      !Number.isFinite(Date.parse(value.updatedAt)) ||
      !Number.isFinite(Date.parse(value.nextUpdateAt)) ||
      Date.parse(value.updatedAt) > Date.now() + 60_000 ||
      Date.now() - Date.parse(value.updatedAt) > 30 * 60_000 ||
      !Array.isArray(value.domestic) || !value.domestic.every(isIndicator) ||
      !Array.isArray(value.global) || !value.global.every(isIndicator) ||
      !Array.isArray(value.economicCalendar) || !value.economicCalendar.every(isCalendarEvent) ||
      !Array.isArray(value.exchangeRates) || !value.exchangeRates.every((rate: unknown) =>
        isRecord(rate) && ['code', 'name', 'symbol', 'formatted'].every((key) => isNonemptyString(rate[key])) &&
        isFiniteNumber(rate.ratePerWld)) ||
      !summary ||
      !['RISK_ON', 'NEUTRAL', 'RISK_OFF'].includes(String(summary.sentiment)) ||
      !['summaryKo', 'summaryEn', 'actionTipKo', 'actionTipEn'].every((key) => isNonemptyString(summary[key]))) {
    return null;
  }
  return value as unknown as MacroPulseData;
}

export function GlobalMacroPulseTicker() {
  const { locale } = useLocale();
  const isEn = locale !== 'ko';

  const [data, setData] = useState<MacroPulseData | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MacroIndicatorData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EconomicCalendarEvent | null>(null);
  const [filterCountry, setFilterCountry] = useState<'ALL' | 'US' | 'KR' | 'EU'>('ALL');
  const [highImpactOnly, setHighImpactOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!cancelled) setLoading(true);
      try {
        const response = await fetch('/app-api/v1/economy/macro-pulse', { cache: 'no-store' });
        if (!response.ok) throw new Error('Macro scenario unavailable');
        const parsed = parseMacroPulse(await response.json());
        if (!parsed) throw new Error('Invalid macro scenario provenance');
        if (!cancelled) setData(parsed);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 10 * 60_000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [refreshIndex]);

  if (!data) {
    return (
      <section className="w-full rounded-2xl border border-slate-700 bg-[#0d131f] p-4 sm:p-5 text-slate-200" aria-busy={loading}>
        <p role="status" className="text-sm" aria-live="polite">
          {loading
            ? (isEn ? 'Loading educational macro scenarios…' : '교육용 거시경제 지표를 불러오는 중입니다…')
            : (isEn ? 'Macro indicators are unavailable. No example values are shown as live data.' : '지표를 불러올 수 없습니다. 임의 수치를 실시간 데이터로 표시하지 않습니다.')}
        </p>
        {!loading && <button type="button" onClick={() => setRefreshIndex((value) => value + 1)}
          className="mt-3 min-h-11 rounded-lg border border-slate-500 px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400">
          {isEn ? 'Retry' : '다시 시도'}
        </button>}
      </section>
    );
  }

  const allIndicators = [...data.domestic, ...data.global];
  const calendarEvents = data.economicCalendar;
  const filteredEvents = calendarEvents.filter((evt) => {
    if (filterCountry !== 'ALL' && evt.country !== filterCountry) return false;
    if (highImpactOnly && evt.importance !== 'HIGH') return false;
    return true;
  });

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0d131f] p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* 1. 상단 상태 헤더 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <Globe className="size-3.5 animate-spin" style={{ animationDuration: '14s' }} />
            <span>{isEn ? 'Educational macro simulation' : '교육용 시뮬레이션 · 거시경제 예시'}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-800">
            {isEn ? 'Example scenarios · refresh every 10m' : '예시 수치 · 10분마다 재조회'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-slate-400 font-medium">{isEn ? 'Sentiment:' : '시장 심리:'}</span>
          <Badge
            variant="outline"
            className={
              data.marketSummary.sentiment === 'RISK_ON'
                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40 font-bold px-2.5 py-0.5'
                : 'border-amber-500/40 text-amber-400 bg-amber-950/40 font-bold px-2.5 py-0.5'
            }
          >
            {data.marketSummary.sentiment === 'RISK_ON'
              ? isEn ? '📈 Risk-On' : '📈 위험 선호 (Risk-On)'
              : data.marketSummary.sentiment === 'RISK_OFF'
                ? (isEn ? '🛡️ Scenario Risk-Off' : '🛡️ 예시: 위험 회피')
                : (isEn ? 'Scenario Neutral' : '예시: 중립')}
          </Badge>
          <span className="text-[11px] text-slate-500 hidden md:inline">
            {isEn ? '· Explore the learning scenario' : '· 학습용 시나리오를 살펴보세요'}
          </span>
        </div>
      </div>

      <p className="text-xs text-amber-300" role="note">
        {isEn
          ? 'Internally generated learning examples, not live central bank rates, market prices, real FX conversion or investment signals.'
          : '내부에서 생성한 학습용 예시입니다. 실제 기준금리·주가지수·환율·WLD 환전 가치 또는 투자 신호가 아닙니다.'}
        <span className="ml-2 text-slate-400">{isEn ? 'Scenario generated:' : '예시 생성:'} {new Date(data.updatedAt).toLocaleString(isEn ? 'en-US' : 'ko-KR')}</span>
      </p>

      {/* 2. 9개 지표 3x3 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allIndicators.map((item) => {
          const isUp = item.changeRate > 0;
          const itemName = isEn ? item.nameEn : item.name;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              type="button"
              className="group flex flex-col justify-between rounded-xl bg-slate-900/90 p-3.5 text-left border border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-800/90 transition-all cursor-pointer min-h-[100px] active:scale-[0.98] shadow-xs"
            >
              {/* 상단: 지표명 및 안내 아이콘 */}
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-xs sm:text-sm text-slate-200 font-bold truncate group-hover:text-emerald-300 transition-colors">
                  {itemName}
                </span>
                <HelpCircle className="size-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* 중단: 모노스페이스 수치 */}
              <div className="my-2 min-w-0">
                <div className="font-mono text-base sm:text-lg font-black text-slate-100 tracking-tight tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.value.toLocaleString()}
                  <span className="text-xs font-semibold text-slate-400 ml-1.5">{item.unit}</span>
                </div>
              </div>

              {/* 하단: 등락률 칩 */}
              <div className="flex items-center">
                {item.changeRate !== 0 ? (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                      isUp
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {isUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                    <span>{isUp ? '+' : ''}{item.changeRate}%</span>
                  </span>
                ) : (
                  <span className="text-xs font-mono font-medium text-slate-400 px-1 py-0.5">
                    {isEn ? 'Unchanged (0.0%)' : '보합 (0.0%)'}
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
              <span>
                {isEn ? 'Illustrative economic calendar (not verified dates)' : '교육용 경제 일정 예시 (실제 일정 미검증)'}
              </span>
            </div>

            {/* 필터 바 */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterCountry('ALL')}
                className={`min-h-11 px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                  filterCountry === 'ALL'
                    ? 'bg-slate-700 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isEn ? 'All' : '전체'}
              </button>
              <button
                type="button"
                onClick={() => setFilterCountry('US')}
                className={`min-h-11 px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                  filterCountry === 'US'
                    ? 'bg-blue-600 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isEn ? 'US' : '미국'}
              </button>
              <button
                type="button"
                onClick={() => setFilterCountry('KR')}
                className={`min-h-11 px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                  filterCountry === 'KR'
                    ? 'bg-rose-600 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isEn ? 'KR' : '한국'}
              </button>
              <button
                type="button"
                onClick={() => setFilterCountry('EU')}
                className={`min-h-11 px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                  filterCountry === 'EU'
                    ? 'bg-amber-600 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isEn ? 'EU' : '유럽'}
              </button>
              <button
                type="button"
                onClick={() => setHighImpactOnly(!highImpactOnly)}
                className={`ml-1 min-h-11 px-3 py-1 rounded-lg border cursor-pointer transition-colors ${
                  highImpactOnly
                    ? 'border-rose-500 bg-rose-950/50 text-rose-300 font-bold'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isEn ? '🔥 High Only' : '🔥 High만'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full max-w-full min-w-0 pb-1 scrollbar-none">
            {filteredEvents.map((evt) => {
              const isHigh = evt.importance === 'HIGH';

              let dDayLabel = evt.dDay === 0 ? (isEn ? 'D-Day Today' : 'D-Day 오늘') : `D-${evt.dDay}`;
              let isPast = false;
              let isToday = false;
              try {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const target = new Date(evt.scheduledDate);
                target.setHours(0, 0, 0, 0);
                const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) {
                  dDayLabel = isEn ? 'Released' : '발표 완료';
                  isPast = true;
                } else if (diffDays === 0) {
                  dDayLabel = isEn ? 'D-Day Today' : 'D-Day 오늘';
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
                  className="shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left cursor-pointer group min-w-[220px]"
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
                      {isEn ? evt.titleEn : evt.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {isEn ? 'Forecast: ' : '예측: '}
                      <strong className="text-slate-300">{evt.forecastValue}</strong>
                      {' '}({isEn ? 'Prev: ' : '이전: '}{evt.previousValue})
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
                    {isEn ? 'Economic Knowledge Base' : '실전 경제 백과사전'}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">{selectedItem.nameEn}</span>
                </div>
                <DialogTitle className="text-lg font-bold text-slate-100 mt-1">
                  {isEn ? selectedItem.nameEn : selectedItem.name} ({selectedItem.value}{selectedItem.unit})
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300">
                  {isEn ? selectedItem.descriptionEn : selectedItem.description}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <BookOpen className="size-4" />
                  <span>{isEn ? 'Investor Takeaway & Practical Tip' : '실전 투자 및 경제 공부 팁'}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {isEn ? selectedItem.educationalTipEn : selectedItem.educationalTip}
                </p>
                {!isEn && selectedItem.educationalTipEn && (
                  <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                    {selectedItem.educationalTipEn}
                  </p>
                )}
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                {isEn
                  ? 'Illustrative figures are generated internally and are not real-time economic observations.'
                  : '이 수치는 내부에서 생성한 교육용 예시이며 실제 거시경제 관측치가 아닙니다.'}
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
                    {selectedEvent.importance === 'HIGH'
                      ? isEn ? '🔥 High Impact' : '🔥 초고위험 영향도 (HIGH)'
                      : isEn ? '⚡ Medium Volatility' : '⚡ 시장 변동성 주의 (MEDIUM)'}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {selectedEvent.dDay === 0
                      ? isEn ? 'D-Day Today' : 'D-Day 오늘'
                      : `D-${selectedEvent.dDay}`}
                  </span>
                </div>
                <DialogTitle className="text-lg font-bold text-slate-100 mt-2">
                  {isEn ? selectedEvent.titleEn : selectedEvent.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 font-mono">
                  {isEn
                    ? `Scheduled: ${selectedEvent.scheduledDate} ${selectedEvent.scheduledTime}`
                    : `${selectedEvent.titleEn} · 예정 일시: ${selectedEvent.scheduledDate} ${selectedEvent.scheduledTime}`}
                </DialogDescription>
              </DialogHeader>

              {/* 3열 비교 그리드: 이전치 vs 예측치 vs 발표 결과 */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-400 font-semibold">
                    {isEn ? 'Previous' : '이전치'}
                  </span>
                  <span className="block text-sm font-bold font-mono text-slate-200 mt-0.5">
                    {selectedEvent.previousValue}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                  <span className="block text-[10px] text-amber-400 font-semibold">
                    {isEn ? 'Forecast' : '예측치'}
                  </span>
                  <span className="block text-sm font-bold font-mono text-amber-300 mt-0.5">
                    {selectedEvent.forecastValue}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                  <span className="block text-[10px] text-blue-400 font-semibold">
                    {isEn ? 'Status' : '결과'}
                  </span>
                  <span className="block text-xs font-mono text-blue-300 font-medium mt-1">
                    {selectedEvent.dDay === 0
                      ? isEn ? 'Awaiting Release' : '발표 대기'
                      : isEn ? 'Pending' : '집계 대기'}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <AlertCircle className="size-4 text-amber-400" />
                  <span>{isEn ? 'Event Analysis & Background' : '이벤트 심층 분석 및 경제적 배경'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isEn ? selectedEvent.analysisEn : selectedEvent.analysisKo}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <TrendingUp className="size-4" />
                  <span>{isEn ? 'Portfolio & Trading Takeaways' : '실전 투자 및 자산 배분 시사점'}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {isEn ? selectedEvent.marketImpactTipEn : selectedEvent.marketImpactTipKo}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}