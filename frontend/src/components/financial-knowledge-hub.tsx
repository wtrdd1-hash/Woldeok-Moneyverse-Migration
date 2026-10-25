'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Globe, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLocale } from '@/components/locale-provider';

interface FinancialTerm {
  readonly id: string;
  readonly term: string;
  readonly termEn: string;
  readonly category: 'stock' | 'banking' | 'macro';
  readonly formula?: string;
  readonly formulaEn?: string;
  readonly explanationKo: string;
  readonly explanationEn: string;
  readonly realWorldExample: string;
  readonly realWorldExampleEn: string;
}

const FINANCIAL_TERMS: readonly FinancialTerm[] = [
  {
    id: 'per',
    term: 'PER (주가수익비율)',
    termEn: 'PER (Price-to-Earnings Ratio)',
    category: 'stock',
    formula: '주가 ÷ 1주당 순이익(EPS)',
    formulaEn: 'Stock Price ÷ Earnings Per Share (EPS)',
    explanationKo: '기업이 벌어들이는 순이익 대비 주가가 몇 배로 거래되고 있는지를 나타내는 대표적인 가치평가(밸류에이션) 지표입니다.',
    explanationEn: 'Measures a company\'s current share price relative to its per-share earnings, indicating market valuation level.',
    realWorldExample: 'PER이 10배라면, 현재 순이익 수준이 10년 동안 유지될 때 투자 원금을 회수할 수 있다는 의미입니다.',
    realWorldExampleEn: 'A P/E of 10 means it will take 10 years of current net earnings to recoup the initial capital invested.',
  },
  {
    id: 'rule72',
    term: '72의 법칙 (복리 배가 공식)',
    termEn: 'The Rule of 72 (Compound Doubling)',
    category: 'banking',
    formula: '원금 2배 달성 연수 = 72 ÷ 연 복리 수익률(%)',
    formulaEn: 'Years to Double = 72 ÷ Annual Compound Rate (%)',
    explanationKo: '복리 투자를 진행할 때 내 자산 원금이 정확히 2배로 불어나는 데 걸리는 시간을 암산할 수 있는 수학 공식입니다.',
    explanationEn: 'A mental shortcut to estimate the number of years required to double invested money at a given compound rate.',
    realWorldExample: '연 7.2% 복리 예금에 1,000만 원을 넣어두면 10년(72 ÷ 7.2) 뒤 원금이 2,000만 원이 됩니다.',
    realWorldExampleEn: 'At a 7.2% annual compound return, an initial investment doubles in exactly 10 years (72 ÷ 7.2).',
  },
  {
    id: 'dca',
    term: 'DCA (정액 분할 적립식 매수)',
    termEn: 'DCA (Dollar-Cost Averaging)',
    category: 'stock',
    formula: '정기적으로 고정된 금액 매수',
    formulaEn: 'Fixed dollar amount at regular intervals',
    explanationKo: '주가의 오르내림과 무관하게 매월 정해진 날짜에 동일한 금액을 기계적으로 매수하여 평단가를 안정화하는 전략입니다.',
    explanationEn: 'Investing equal monetary amounts at regular intervals regardless of asset price, smoothing market volatility.',
    realWorldExample: '주가가 폭락할 때는 더 많은 주식을 사고, 급등할 때는 적은 주식을 사서 장기적으로 평균 매입단가가 크게 낮아집니다.',
    realWorldExampleEn: 'Automatically buys more shares when prices drop and fewer shares when prices peak, lowering your long-term average cost.',
  },
  {
    id: 'mdd',
    term: 'MDD (최대 낙폭)',
    termEn: 'MDD (Maximum Drawdown)',
    category: 'stock',
    formula: '(최저점 - 최고점) ÷ 최고점 × 100%',
    formulaEn: '(Trough Value - Peak Value) ÷ Peak Value × 100%',
    explanationKo: '특정 투자 기간 동안 최고점에서 최저점까지 기록한 최대 손실률로, 멘탈과 리스크 관리의 핵심 지표입니다.',
    explanationEn: 'The maximum observed loss from a peak to a trough of a portfolio before a new peak is attained.',
    realWorldExample: '수익률이 높아도 MDD가 -50%라면 대부분의 일반 투자자는 패닉 셀(공포 매도)로 탈락하게 됩니다.',
    realWorldExampleEn: 'Even if average returns are high, an MDD of -50% often forces retail investors into catastrophic panic selling.',
  },
  {
    id: 'real_interest',
    term: '실질금리 (인플레이션 차감 금리)',
    termEn: 'Real Interest Rate',
    category: 'macro',
    formula: '명목금리 - 인플레이션(물가상승률)',
    formulaEn: 'Nominal Interest Rate - Inflation Rate',
    explanationKo: '통장에 찍히는 이자율(명목금리)에서 물가 상승으로 인한 화폐 가치 하락분을 뺀 실제 구매력 기준의 이자율입니다.',
    explanationEn: 'The lending interest rate adjusted for inflation, representing true growth in purchasing power.',
    realWorldExample: '은행 예금 금리가 4%여도 물가가 3.5% 오르면 내 실제 자산 증식률은 0.5%에 불과합니다.',
    realWorldExampleEn: 'If a bank deposit yields 4% while CPI inflation is 3.5%, your actual purchasing power only expands by 0.5%.',
  },
  {
    id: 'pbr',
    term: 'PBR (주가순자산비율)',
    termEn: 'PBR (Price-to-Book Ratio)',
    category: 'stock',
    formula: '주가 ÷ 1주당 순자산(BPS)',
    formulaEn: 'Stock Price ÷ Book Value Per Share (BVPS)',
    explanationKo: '기업이 당장 모든 사업을 청산하고 빚을 갚았을 때 주주에게 돌아갈 순자산 가치 대비 주가 수준을 비교합니다.',
    explanationEn: 'Compares a company\'s market value to its book value, gauging asset-backed downside protection.',
    realWorldExample: 'PBR이 1배 미만이면 회사를 지금 당장 해산해서 주주들에게 나눠주는 돈보다 주가가 저평가되어 있다는 뜻입니다.',
    realWorldExampleEn: 'A P/B below 1.0 indicates the stock is trading for less than the net liquidated value of its physical assets.',
  },
];

export function FinancialKnowledgeHub() {
  const { locale } = useLocale();
  const [krwInput, setKrwInput] = useState<number>(10000);
  const [activeLang, setActiveLang] = useState<'ko' | 'en'>(locale === 'ko' ? 'ko' : 'en');
  const [mockModalOpen, setMockModalOpen] = useState(false);

  useEffect(() => {
    setActiveLang(locale === 'ko' ? 'ko' : 'en');
  }, [locale]);

  const isEn = activeLang === 'en';

  const krw = krwInput;
  const usd = Number((krwInput / 1382.4).toFixed(2));
  const jpy = Number(((krwInput / 1382.4) * 153.2).toFixed(1));
  const eur = Number(((krwInput / 1382.4) * 0.92).toFixed(2));

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
                <span>{isEn ? 'Practical Financial & Economic Literacy Academy' : '실전 금융 & 경제 지식 아카데미'}</span>
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 text-[10px]">
                  Global Financial Literacy
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                {isEn
                  ? 'Explore finance formulas and explicitly illustrative currency examples. No live rates or trading claims.'
                  : '금융 원리와 고정된 예시 환율로 계산 방법을 학습하세요. 실시간 환율이나 투자 수익을 제공하지 않습니다.'}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveLang('ko')}
              type="button"
              className={`min-h-11 px-3 py-2 text-xs rounded-lg font-bold transition-all ${
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
              className={`min-h-11 px-3 py-2 text-xs rounded-lg font-bold transition-all ${
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
        {/* Fixed classroom exercise: no WLD-to-fiat conversion or live FX feed. */}
        <section aria-label={isEn ? 'Illustrative currency calculation' : '교육용 환율 예시'} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Globe className="size-4 text-emerald-400" />
              {isEn ? 'Illustrative Currency Example' : '교육용 예시 환율 계산기'}
            </span>
            <span className="text-[10px] text-slate-400">{isEn ? 'Example: USD 1 ≈ KRW 1,382.4 (fixed)' : '예시 환율: USD 1 ≈ KRW 1,382.4 (고정)'}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-5 sm:items-center">
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="sample-krw-amount" className="block text-xs text-slate-300">{isEn ? 'Example Amount (KRW)' : '예시 금액 (KRW)'}</label>
              <Input id="sample-krw-amount" type="number" min={1} max={1000000000} value={krwInput}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setKrwInput(Number.isFinite(value) ? Math.min(1000000000, Math.max(1, Math.trunc(value))) : 1);
                }}
                className="min-h-11 bg-slate-900 border-slate-700 text-white font-mono" />
            </div>
            <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2" aria-live="polite">
              {[
                ['KRW', `₩${krw.toLocaleString()}`],
                ['USD', `$${usd.toLocaleString()}`],
                ['JPY', `¥${jpy.toLocaleString()}`],
                ['EUR', `€${eur.toLocaleString()}`],
              ].map(([currency, amount]) => (
                <div key={currency} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-400">{currency}</span>
                  <span className="block font-mono text-xs font-bold text-white mt-0.5">{amount}</span>
                </div>
              ))}
            </div>
          </div>
          <p role="note" className="mt-3 text-xs leading-relaxed text-amber-200">
            {isEn
              ? 'These fixed rates are not live exchange rates. They illustrate arithmetic only. Virtual WLD cannot be exchanged for cash.'
              : '실제 환율이 아니며 계산 방법을 보여 주는 고정 예시입니다. 가상 WLD는 현금으로 환전할 수 없습니다.'}
          </p>
        </section>

        {/* 파트 2: 금융 용어 백과사전 6대 카드 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="size-4 text-amber-400" />
              <span>{isEn ? 'Essential Financial Formulas & Valuation Ratios' : '실전 투자 핵심 용어 & 공식 (Essential Financial Formulas)'}</span>
            </span>
            <span className="text-[10px] text-slate-500">
              {isEn ? 'Must-master formulas from beginners to seasoned traders' : '초보자부터 실전 투자자까지 필수 마스터'}
            </span>
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
                      {isEn ? item.termEn : item.term}
                    </span>
                    <Badge variant="outline" className="border-slate-700 text-[10px] text-slate-400">
                      {item.category.toUpperCase()}
                    </Badge>
                  </div>

                  {(item.formula || item.formulaEn) && (
                    <div className="mt-1.5 rounded bg-slate-900/80 px-2 py-1 border border-slate-800 text-[11px] font-mono font-semibold text-cyan-300">
                      {isEn ? `Formula: ${item.formulaEn || item.formula}` : `공식: ${item.formula}`}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {isEn ? item.explanationEn : item.explanationKo}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400/90 bg-emerald-950/10 p-2 rounded-lg border border-emerald-500/20">
                  <span className="font-semibold block text-[10px] text-emerald-500">
                    {isEn ? 'Practical Example:' : '실전 예시 (Example):'}
                  </span>
                  {isEn ? item.realWorldExampleEn : item.realWorldExample}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional navigation to existing server-authoritative market, never a local trade. */}
        <section aria-label={isEn ? 'Optional virtual market learning' : '선택형 가상 시장 학습'} className="pt-3 border-t border-slate-800/80">
          <div className="rounded-xl border border-amber-500/30 bg-slate-950/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">{isEn ? 'Optional: Explore the Fictional Stock Market' : '선택 학습: 가상 주식 시장 알아보기'}</p>
              <p className="text-xs text-slate-300">
                {isEn
                  ? 'Compare server-authoritative in-game quotes. No free WLD or stock purchase is promised.'
                  : '서버에서 확인한 게임 내 시세를 비교하고 원할 때 거래소를 방문하세요. 무료 WLD나 매수를 약속하지 않습니다.'}
              </p>
            </div>
            <Button type="button" onClick={() => setMockModalOpen(true)} className="min-h-11 shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
              {isEn ? 'Explore Virtual Market' : '가상 시장 알아보기'}
            </Button>
          </div>
        </section>
      </CardContent>

      <Dialog open={mockModalOpen} onOpenChange={setMockModalOpen}>
        <DialogContent className="max-w-md border-slate-800 bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle>{isEn ? 'Choose a Verified Market View' : '실제 서버 시세 확인하기'}</DialogTitle>
            <DialogDescription className="text-sm text-slate-300">
              {isEn
                ? 'This learning panel never places orders or credits rewards. Server-verified quotes and order confirmation are handled separately.'
                : '이 학습 화면에서는 WLD 보상이나 주식 체결은 발생하지 않습니다. 시세 조회와 실제 주문·정산은 별도 서버 기반 화면에서 처리됩니다.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 pt-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="min-h-11 h-auto whitespace-normal border-slate-600 text-white hover:bg-slate-800">
              <Link href="/stocks/compare">{isEn ? 'Compare Server Quotes' : '서버 시세로 종목 비교'}</Link>
            </Button>
            <Button asChild className="min-h-11 h-auto whitespace-normal bg-amber-500 text-slate-950 hover:bg-amber-400">
              <Link href="/stocks">{isEn ? 'Virtual Stock Exchange' : '실제 가상 거래소'}</Link>
            </Button>
          </div>
          <Button type="button" variant="ghost" onClick={() => setMockModalOpen(false)} className="min-h-11 text-slate-300 hover:bg-slate-800">
            {isEn ? 'Continue Learning' : '학습 계속하기'}
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}