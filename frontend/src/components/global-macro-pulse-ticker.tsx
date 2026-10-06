'use client';

import React, { useState, useEffect } from 'react';
import { Globe, TrendingUp, TrendingDown, HelpCircle, ArrowUpRight, DollarSign, Sparkles, BookOpen, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
    { id: 'bok_rate', name: '한국은행 기준금리', nameEn: 'BOK Base Rate', value: 3.25, unit: '%', changeRate: 0, description: '중앙은행 기준금리', descriptionEn: 'Central Bank Policy Rate', educationalTip: '금리가 오르면 저축 이자가 커지고 주식 시장 유동성은 축소됩니다.', educationalTipEn: 'Higher rates boost bank interest while curbing equity liquidity.' },
    { id: 'kospi', name: 'KOSPI 코스피', nameEn: 'KOSPI Index', value: 2642.8, unit: 'pt', changeRate: 0.45, description: '한국 종합주가지수', descriptionEn: 'Korea Benchmark Index', educationalTip: '반도체와 수출 대형주 비중이 높아 환율 변동에 민감합니다.', educationalTipEn: 'Sensitive to FX swings due to heavy semiconductor exports.' },
    { id: 'usd_krw', name: '원/달러 환율', nameEn: 'USD/KRW', value: 1382.4, unit: '원', changeRate: 0.12, description: '1달러당 원화 가치', descriptionEn: 'Exchange Rate', educationalTip: '환율 상승 시 수출 기업 마진이 개선되나 수입 물가 압력이 발생합니다.', educationalTipEn: 'Boosts export margins but imports inflation pressure.' },
  ],
  global: [
    { id: 'fed_funds', name: '미국 연준 기준금리', nameEn: 'Fed Funds Rate', value: 4.75, unit: '%', changeRate: 0, description: '미국 기축통화 정책금리', descriptionEn: 'US Target Rate', educationalTip: '글로벌 자산 가격의 할인율이자 자금 이동의 최대 나침반입니다.', educationalTipEn: 'Primary benchmark discount rate for global capital flows.' },
    { id: 'sp500', name: 'S&P 500', nameEn: 'S&P 500 Index', value: 5784.5, unit: 'pt', changeRate: 0.38, description: '미국 500대 우량주', descriptionEn: 'US Large Cap Index', educationalTip: '장기 적립식 복리 투자의 가장 대표적인 글로벌 벤치마크입니다.', educationalTipEn: 'Gold standard for long-term compounding index portfolios.' },
    { id: 'nasdaq', name: 'NASDAQ 나스닥', nameEn: 'NASDAQ Composite', value: 18260.2, unit: 'pt', changeRate: 0.72, description: '글로벌 기술 성장주', descriptionEn: 'Tech Innovation Index', educationalTip: '금리 하락기에 미래 이익 가치가 부각되어 가장 강하게 상승합니다.', educationalTipEn: 'Outperforms during rate cuts due to lower discount rates.' },
  ],
  exchangeRates: [
    { code: 'KRW', name: '원화', symbol: '₩', ratePerWld: 100, formatted: '100원' },
    { code: 'USD', name: '달러', symbol: '$', ratePerWld: 0.0723, formatted: '$0.0723' },
    { code: 'JPY', name: '엔화', symbol: '¥', ratePerWld: 11.08, formatted: '¥11.08' },
  ],
  marketSummary: {
    sentiment: 'RISK_ON',
    summaryKo: '글로벌 유동성 개선 신호로 기술 성장주 선호 심리가 우세합니다.',
    summaryEn: 'Risk-on sentiment supported by tech resilience.',
    actionTipKo: '💡 실전 팁: 한미 금리차(1.50%p)를 이해하면 왜 분산 투자가 필수적인지 알 수 있습니다.',
    actionTipEn: '💡 Pro Tip: The rate spread explains cross-border asset flows.',
  },
};

export function GlobalMacroPulseTicker() {
  const [data, setData] = useState<MacroPulseData>(FALLBACK_PULSE);
  const [selectedItem, setSelectedItem] = useState<MacroIndicatorData | null>(null);

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

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 shadow-md backdrop-blur-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
            <Globe className="size-3 animate-spin" style={{ animationDuration: '10s' }} />
            <span>실시간 국내외 거시경제 펄스 (Macro Economy)</span>
          </div>
          <span className="hidden sm:inline text-[10px] text-slate-500 font-mono">10분 자동 갱신</span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">시장 심리:</span>
          <Badge
            variant="outline"
            className={
              data.marketSummary.sentiment === 'RISK_ON'
                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30 font-bold'
                : 'border-amber-500/40 text-amber-400 bg-amber-950/30 font-bold'
            }
          >
            {data.marketSummary.sentiment === 'RISK_ON' ? '📈 위험선호 (Risk-On)' : '🛡️ 방어적 분산 (Risk-Off)'}
          </Badge>
          <span className="text-[10px] text-slate-500 hidden md:inline">· 지표를 클릭하면 실전 경제 해설이 열립니다</span>
        </div>
      </div>

      {/* 가로 스크롤 지표 그리드 */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {allIndicators.map((item) => {
          const isUp = item.changeRate > 0;
          const isDown = item.changeRate < 0;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              type="button"
              className="group flex flex-col justify-between rounded-lg bg-slate-900/70 p-2 text-left border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-850 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] text-slate-400 font-medium truncate group-hover:text-slate-200">
                  {item.name}
                </span>
                <HelpCircle className="size-3 text-slate-500 group-hover:text-emerald-400 shrink-0" />
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono text-xs sm:text-sm font-bold text-white">
                  {item.value.toLocaleString()}
                  <span className="text-[10px] font-normal text-slate-400 ml-0.5">{item.unit}</span>
                </span>

                {item.changeRate !== 0 && (
                  <span
                    className={`text-[10px] font-mono font-bold flex items-center ${
                      isUp ? 'text-rose-400' : 'text-blue-400'
                    }`}
                  >
                    {isUp ? '+' : ''}{item.changeRate}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 실전 금융 지식 해설 팝업 모달 */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-md border-slate-800 bg-slate-900 text-white">
          {selectedItem && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs">
                    실전 경제 백과사전
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">{selectedItem.nameEn}</span>
                </div>
                <DialogTitle className="text-lg font-bold text-white mt-1">
                  {selectedItem.name} ({selectedItem.value}{selectedItem.unit})
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300">
                  {selectedItem.description}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <BookOpen className="size-4" />
                  <span>실전 투자 및 경제 공부 팁 (Key Takeaway)</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedItem.educationalTip}
                </p>
                <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                  {selectedItem.educationalTipEn}
                </p>
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                월덕 머니버스의 가상 주식 및 복리 예금은 실제 거시경제 논리를 그대로 반영하여 시뮬레이션됩니다.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
