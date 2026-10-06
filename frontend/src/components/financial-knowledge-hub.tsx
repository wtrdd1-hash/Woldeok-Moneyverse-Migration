'use client';

import React, { useState } from 'react';
import { BookOpen, Calculator, Globe, Sparkles, TrendingUp, Layers, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface FinancialTerm {
  readonly id: string;
  readonly term: string;
  readonly termEn: string;
  readonly category: 'stock' | 'banking' | 'macro';
  readonly formula?: string;
  readonly explanationKo: string;
  readonly explanationEn: string;
  readonly realWorldExample: string;
}

const FINANCIAL_TERMS: readonly FinancialTerm[] = [
  {
    id: 'per',
    term: 'PER (주가수익비율)',
    termEn: 'Price-to-Earnings Ratio',
    category: 'stock',
    formula: '주가 ÷ 1주당 순이익(EPS)',
    explanationKo: '기업이 벌어들이는 순이익 대비 주가가 몇 배로 거래되고 있는지를 나타내는 대표적인 가치평가(밸류에이션) 지표입니다.',
    explanationEn: 'Measures a company\'s current share price relative to its per-share earnings, indicating valuation level.',
    realWorldExample: 'PER이 10배라면, 현재 순이익 수준이 10년 동안 유지될 때 투자 원금을 회수할 수 있다는 의미입니다.',
  },
  {
    id: 'rule72',
    term: '72의 법칙 (복리 배가 공식)',
    termEn: 'The Rule of 72',
    category: 'banking',
    formula: '원금 2배 달성 연수 = 72 ÷ 연 복리 수익률(%)',
    explanationKo: '복리 투자를 진행할 때 내 자산 원금이 정확히 2배로 불어나는 데 걸리는 시간을 암산할 수 있는 수학 공식입니다.',
    explanationEn: 'A simple mathematical shortcut to estimate the number of years required to double money at a fixed compound rate.',
    realWorldExample: '연 7.2% 복리 예금에 1,000만 원을 넣어두면 10년(72 ÷ 7.2) 뒤 원금이 2,000만 원이 됩니다.',
  },
  {
    id: 'dca',
    term: 'DCA (정액 분할 적립식 매수)',
    termEn: 'Dollar-Cost Averaging',
    category: 'stock',
    formula: '정기적으로 고정된 금액 매수',
    explanationKo: '주가의 오르내림과 무관하게 매월 정해진 날짜에 동일한 금액을 기계적으로 매수하여 평단가를 안정화하는 전략입니다.',
    explanationEn: 'Investing equal monetary amounts at regular intervals regardless of asset price, smoothing market volatility.',
    realWorldExample: '주가가 폭락할 때는 더 많은 주식을 사고, 급등할 때는 적은 주식을 사서 장기적으로 평균 매입단가가 크게 낮아집니다.',
  },
  {
    id: 'mdd',
    term: 'MDD (최대 낙폭)',
    termEn: 'Maximum Drawdown',
    category: 'stock',
    formula: '(최저점 - 최고점) ÷ 최고점 × 100%',
    explanationKo: '특정 투자 기간 동안 최고점에서 최저점까지 기록한 최대 손실률로, 멘탈과 리스크 관리의 핵심 지표입니다.',
    explanationEn: 'The maximum observed loss from a peak to a trough of a portfolio before a new peak is attained.',
    realWorldExample: '수익률이 높아도 MDD가 -50%라면 대부분의 일반 투자자는 패닉 셀(공포 매도)로 탈락하게 됩니다.',
  },
  {
    id: 'real_interest',
    term: '실질금리 (인플레이션 차감 금리)',
    termEn: 'Real Interest Rate',
    category: 'macro',
    formula: '명목금리 - 인플레이션(물가상승률)',
    explanationKo: '통장에 찍히는 이자율(명목금리)에서 물가 상승으로 인한 화폐 가치 하락분을 뺀 실제 구매력 기준의 이자율입니다.',
    explanationEn: 'The lending interest rate adjusted for inflation, representing true growth in purchasing power.',
    realWorldExample: '은행 예금 금리가 4%여도 물가가 3.5% 오르면 내 실제 자산 증식률은 0.5%에 불과합니다.',
  },
  {
    id: 'pbr',
    term: 'PBR (주가순자산비율)',
    termEn: 'Price-to-Book Ratio',
    category: 'stock',
    formula: '주가 ÷ 1주당 순자산(BPS)',
    explanationKo: '기업이 당장 모든 사업을 청산하고 빚을 갚았을 때 주주에게 돌아갈 순자산 가치 대비 주가 수준을 비교합니다.',
    explanationEn: 'Compares a company\'s market value to its book value, gauging asset-backed downside protection.',
    realWorldExample: 'PBR이 1배 미만이면 회사를 지금 당장 해산해서 주주들에게 나눠주는 돈보다 주가가 저평가되어 있다는 뜻입니다.',
  },
];

export function FinancialKnowledgeHub() {
  const [wldInput, setWldInput] = useState<number>(10000);
  const [activeLang, setActiveLang] = useState<'ko' | 'en'>('ko');

  const krw = wldInput * 100;
  const usd = Number(((wldInput * 100) / 1382.4).toFixed(2));
  const jpy = Number((((wldInput * 100) / 1382.4) * 153.2).toFixed(1));
  const eur = Number((((wldInput * 100) / 1382.4) * 0.92).toFixed(2));

  return (
    <Card className="border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-xl">
      <CardHeader className="pb-4 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                <span>실전 금융 & 경제 지식 아카데미</span>
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 text-[10px]">
                  Global Financial Literacy
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                실제 투자와 자산 관리에 뼈와 살이 되는 국내외 금융 원리와 실시간 환율을 학습하세요.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveLang('ko')}
              type="button"
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                activeLang === 'ko'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/50'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              한국어 (KR)
            </button>
            <button
              onClick={() => setActiveLang('en')}
              type="button"
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                activeLang === 'en'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/50'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              English (Global)
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* 파트 1: 글로벌 통화 실시간 변환기 */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Globe className="size-4 text-emerald-400" />
              <span>글로벌 실시간 환율 변환기 (Global Currency Calculator)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">기준 환율: $1 = 1,382.4원</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
            <div className="sm:col-span-2 space-y-1">
              <span className="text-[11px] text-slate-400">가상 자산 입력 (WLD)</span>
              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  value={wldInput}
                  onChange={(e) => setWldInput(Math.max(1, Number(e.target.value) || 0))}
                  className="bg-slate-900 border-slate-700 text-white font-mono font-bold text-sm pr-14"
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono text-emerald-400 font-bold">WLD</span>
              </div>
            </div>

            <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 sm:pt-0">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-400">대한민국 (KRW)</span>
                <span className="block font-mono text-xs font-bold text-white mt-0.5">₩{krw.toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-400">미국 (USD)</span>
                <span className="block font-mono text-xs font-bold text-emerald-400 mt-0.5">${usd.toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-400">일본 (JPY)</span>
                <span className="block font-mono text-xs font-bold text-cyan-400 mt-0.5">¥{jpy.toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <span className="block text-[10px] text-slate-400">유럽 (EUR)</span>
                <span className="block font-mono text-xs font-bold text-indigo-400 mt-0.5">€{eur.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 파트 2: 금융 용어 백과사전 6대 카드 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="size-4 text-amber-400" />
              <span>실전 투자 핵심 용어 & 공식 (Essential Financial Formulas)</span>
            </span>
            <span className="text-[10px] text-slate-500">초보자부터 실전 투자자까지 필수 마스터</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {FINANCIAL_TERMS.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {activeLang === 'ko' ? item.term : item.termEn}
                    </span>
                    <Badge variant="outline" className="border-slate-700 text-[10px] text-slate-400">
                      {item.category.toUpperCase()}
                    </Badge>
                  </div>

                  {item.formula && (
                    <div className="mt-1.5 rounded bg-slate-900/80 px-2 py-1 border border-slate-800 text-[11px] font-mono font-semibold text-cyan-300">
                      공식: {item.formula}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {activeLang === 'ko' ? item.explanationKo : item.explanationEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400/90 bg-emerald-950/10 p-2 rounded-lg border border-emerald-500/20">
                  <span className="font-semibold block text-[10px] text-emerald-500">실전 예시 (Example):</span>
                  {item.realWorldExample}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
