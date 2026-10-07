'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Globe2,
  Landmark,
  Calendar,
  AlertCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MacroIndicator {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  readonly unit: string;
  readonly changeRate: number;
  readonly description: string;
  readonly educationalTip: string;
}

interface GlobalCurrencyRate {
  readonly code: string;
  readonly name: string;
  readonly symbol: string;
  readonly ratePerWld: number;
  readonly formatted: string;
}

interface EconomicCalendarEvent {
  readonly id: string;
  readonly title: string;
  readonly scheduledDate: string;
  readonly dDay: number;
  readonly importance: 'HIGH' | 'MEDIUM' | 'LOW';
  readonly analysisKo: string;
  readonly marketImpactTipKo: string;
}

interface MacroPulseData {
  readonly updatedAt: string;
  readonly domestic: readonly MacroIndicator[];
  readonly global: readonly MacroIndicator[];
  readonly exchangeRates: readonly GlobalCurrencyRate[];
  readonly economicCalendar: readonly EconomicCalendarEvent[];
  readonly marketSummary: {
    readonly sentiment: 'RISK_ON' | 'NEUTRAL' | 'RISK_OFF';
    readonly summaryKo: string;
    readonly actionTipKo: string;
  };
}

const FALLBACK_MACRO_DATA: MacroPulseData = {
  updatedAt: new Date().toISOString(),
  domestic: [
    {
      id: 'base_rate_kr',
      name: '한국 기준금리',
      value: 3.50,
      unit: '%',
      changeRate: 0.0,
      description: '한국은행 금융통화위원회 기준 정책금리',
      educationalTip: '기준금리가 동결되면 가계 및 기업 대출 이자 부담이 유지됩니다.',
    },
    {
      id: 'cpi_kr',
      name: '소비자물가지수(CPI)',
      value: 2.30,
      unit: '%',
      changeRate: -0.2,
      description: '전년 동월 대비 소비자 물가 상승률',
      educationalTip: '물가상승률이 2%대 목표치에 근접하며 금리 인하 기대감이 확대됩니다.',
    },
    {
      id: 'm2_liquidity',
      name: '월덱 광의통화(M2)',
      value: 12450000,
      unit: 'WLD',
      changeRate: 1.8,
      description: '월덱 머니버스 생태계 내 유통 총 통화량',
      educationalTip: '통화량이 증가할수록 주식 및 가상 자산의 유동성 프리미엄이 발생합니다.',
    },
  ],
  global: [
    {
      id: 'fed_rate_us',
      name: '미국 연준 기준금리',
      value: 5.25,
      unit: '%',
      changeRate: 0.0,
      description: '미 연방준비제도(Fed) 연방기금 정책금리',
      educationalTip: '한미 금리차(1.75%p)가 유지되며 외국인 자금 이동의 주요 변수입니다.',
    },
    {
      id: 'us_treasury_10y',
      name: '미 10년물 국채금리',
      value: 4.12,
      unit: '%',
      changeRate: -0.05,
      description: '글로벌 무위험 채권의 벤치마크 수익률',
      educationalTip: '장기채 금리 하락은 주식 시장의 밸류에이션 부담을 낮춰줍니다.',
    },
  ],
  exchangeRates: [
    { code: 'USD', name: '미국 달러', symbol: '$', ratePerWld: 1342.5, formatted: '1 WLD = 1,342.50 KRW' },
    { code: 'JPY', name: '일본 엔화 (100엔)', symbol: '¥', ratePerWld: 915.2, formatted: '100 JPY = 915.20 KRW' },
    { code: 'EUR', name: '유럽 유로', symbol: '€', ratePerWld: 1468.8, formatted: '1 EUR = 1,468.80 KRW' },
  ],
  economicCalendar: [
    {
      id: 'cal_fomc',
      title: '미 연준 FOMC 정례회의 기준금리 결정',
      scheduledDate: '2026-10-15',
      dDay: 8,
      importance: 'HIGH',
      analysisKo: '기준금리 인하 사이클 진입 여부 및 점도표 수정 발표 예정',
      marketImpactTipKo: '금리 인하 신호 시 가상 주식 및 성장주 섹터 전반에 강한 훈풍 예상',
    },
    {
      id: 'cal_cpi',
      title: '미국 9월 소비자물가지수(CPI) 발표',
      scheduledDate: '2026-10-12',
      dDay: 5,
      importance: 'HIGH',
      analysisKo: '근원 CPI 예상치 2.8% 부합 여부가 핵심 관전 포인트',
      marketImpactTipKo: '예상치 하회 시 조기 금리 인하 기대감으로 나스닥/월덱 주식 강세',
    },
  ],
  marketSummary: {
    sentiment: 'RISK_ON',
    summaryKo: '글로벌 금리 인하 기대감과 통화 유동성 확대로 금융 시장 전반의 투자 심리가 활성화되고 있습니다.',
    actionTipKo: '우량 가상 주식 및 복리 예금 포트폴리오를 분산 구축하여 안정적인 수익을 추구하세요.',
  },
};

export function MacroLiquidityDashboard() {
  const [data, setData] = useState<MacroPulseData>(FALLBACK_MACRO_DATA);
  const [activeTab, setActiveTab] = useState<'domestic' | 'global' | 'fx' | 'calendar'>('domestic');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchMacroPulse = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/v1/economy/macro-pulse', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.domestic) {
          setData(json);
        }
      }
    } catch {
      // Fallback data already loaded
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMacroPulse();
  }, []);

  const getSentimentBadge = (sentiment: MacroPulseData['marketSummary']['sentiment']) => {
    switch (sentiment) {
      case 'RISK_ON':
        return (
          <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 flex items-center gap-1 font-bold">
            <TrendingUp className="size-3" />
            위험 선호 (RISK-ON 🔥)
          </Badge>
        );
      case 'RISK_OFF':
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 flex items-center gap-1 font-bold">
            <ShieldAlert className="size-3" />
            안전 선호 (RISK-OFF 🛡️)
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 flex items-center gap-1 font-bold">
            <Activity className="size-3" />
            시장 관망 (NEUTRAL ⚖️)
          </Badge>
        );
    }
  };

  return (
    <Card className="relative overflow-hidden border-zinc-800/80 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Globe2 className="size-4" />
              </div>
              <CardTitle className="text-base font-bold text-foreground">
                중앙은행 통화량 & 거시경제 실시간 대시보드
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              한국은행, 연준(Fed), 월덱 M2 통화량 및 글로벌 외환 시장의 유동성 지표를 실시간 모니터링합니다.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {getSentimentBadge(data.marketSummary.sentiment)}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMacroPulse}
              disabled={isRefreshing}
              className="h-7 px-2 text-xs border-zinc-700/60"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/50 pt-3">
          <Button
            variant={activeTab === 'domestic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('domestic')}
            className="h-7 text-xs font-semibold"
          >
            <Landmark className="size-3.5 mr-1" />
            국내/월덱 지표
          </Button>
          <Button
            variant={activeTab === 'global' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('global')}
            className="h-7 text-xs font-semibold"
          >
            <Globe2 className="size-3.5 mr-1" />
            글로벌 금리/채권
          </Button>
          <Button
            variant={activeTab === 'fx' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('fx')}
            className="h-7 text-xs font-semibold"
          >
            <TrendingUp className="size-3.5 mr-1" />
            글로벌 환율
          </Button>
          <Button
            variant={activeTab === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('calendar')}
            className="h-7 text-xs font-semibold"
          >
            <Calendar className="size-3.5 mr-1" />
            경제 캘린더
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tab Content: Domestic Indicators */}
        {activeTab === 'domestic' && (
          <div className="grid gap-3 sm:grid-cols-3">
            {data.domestic.map((ind) => (
              <div
                key={ind.id}
                className="p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">{ind.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono font-bold ${
                        ind.changeRate > 0
                          ? 'text-rose-400 border-rose-500/30'
                          : ind.changeRate < 0
                            ? 'text-blue-400 border-blue-500/30'
                            : 'text-zinc-400'
                      }`}
                    >
                      {ind.changeRate > 0 ? '+' : ''}
                      {ind.changeRate}%
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-extrabold font-mono text-foreground tracking-tight">
                      {ind.value.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">{ind.unit}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {ind.description}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-zinc-400 flex items-start gap-1">
                  <Sparkles className="size-3 text-amber-400 shrink-0 mt-0.5" />
                  <span>{ind.educationalTip}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Global Indicators */}
        {activeTab === 'global' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.global.map((ind) => (
              <div
                key={ind.id}
                className="p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">{ind.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono font-bold ${
                        ind.changeRate > 0
                          ? 'text-rose-400 border-rose-500/30'
                          : ind.changeRate < 0
                            ? 'text-blue-400 border-blue-500/30'
                            : 'text-zinc-400'
                      }`}
                    >
                      {ind.changeRate > 0 ? '+' : ''}
                      {ind.changeRate}%
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-extrabold font-mono text-foreground tracking-tight">
                      {ind.value.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">{ind.unit}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {ind.description}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-zinc-400 flex items-start gap-1">
                  <Sparkles className="size-3 text-amber-400 shrink-0 mt-0.5" />
                  <span>{ind.educationalTip}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Foreign Exchange (FX) */}
        {activeTab === 'fx' && (
          <div className="grid gap-3 sm:grid-cols-3">
            {data.exchangeRates.map((fx) => (
              <div
                key={fx.code}
                className="p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground">{fx.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">({fx.code})</span>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-primary">{fx.symbol}</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-extrabold font-mono text-foreground tracking-tight">
                    {fx.ratePerWld.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">KRW</span>
                </div>
                <p className="mt-1 text-[11px] font-mono text-muted-foreground">{fx.formatted}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Economic Calendar */}
        {activeTab === 'calendar' && (
          <div className="space-y-2.5">
            {data.economicCalendar.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <Badge
                    variant="outline"
                    className="mt-0.5 shrink-0 text-xs font-mono font-extrabold text-amber-400 border-amber-500/30 bg-amber-500/10"
                  >
                    D-{evt.dDay}
                  </Badge>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{evt.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {evt.analysisKo}
                    </p>
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <Badge variant="secondary" className="text-[10px] font-bold text-rose-400 bg-rose-500/10">
                    중요도: {evt.importance}
                  </Badge>
                  <p className="text-[10px] text-zinc-400 mt-1 max-w-xs">{evt.marketImpactTipKo}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Market Summary Footer */}
        <div className="p-3 rounded-xl border border-border/50 bg-muted/30 flex items-start gap-2.5 text-xs">
          <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-bold text-foreground">거시 통화 브리핑: </span>
            <span className="text-muted-foreground">{data.marketSummary.summaryKo} </span>
            <span className="font-semibold text-primary">{data.marketSummary.actionTipKo}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
