'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, CheckCircle2, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Link from 'next/link';
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
  const [activeLang, setActiveLang] = useState<'ko' | 'en'>(locale === 'ko' ? 'ko' : 'en');
  const [mockModalOpen, setMockModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState('CHIPS');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    setActiveLang(locale === 'ko' ? 'ko' : 'en');
  }, [locale]);

  const isEn = activeLang === 'en';


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
                  ? 'Learn investing formulas and valuation concepts with clearly fictional examples. No virtual WLD is redeemable for fiat.'
                  : '가상의 예시를 통해 금융 원리와 투자 지표를 학습합니다. 게임 WLD는 실제 통화로 환전할 수 없습니다.'}
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
        {/* This educational page never converts virtual WLD into fiat. */}
        <section aria-label={isEn ? 'Virtual currency disclosure' : '가상 화폐 안내'} className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-sm text-slate-200">
          <p className="font-semibold">{isEn ? 'WLD is not convertible to real-world currency.' : 'WLD는 실제 통화로 환전할 수 없습니다.'}</p>
          <p className="mt-1 text-xs text-slate-400">
            {isEn ? 'This is a virtual-economy learning exercise. No exchange rate, fiat value, grant, stock fill or account credit is offered here.' : '이곳은 가상 경제 학습 공간입니다. 실제 환율·현금 가치·지원금·주식 체결·계좌 입금을 제공하지 않습니다.'}
          </p>
        </section>

        {/* 파트 2: 금융 용어 백과사전 6대 카드 */}
        <p className="text-xs text-slate-400">{isEn ? 'Examples and ratios below are educational illustrations, not verified quotes or recommendations.' : '아래 예시 수치와 투자 지표는 학습용 가정이며 실제 시세나 투자 권유가 아닙니다.'}</p>
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

        {/* 파트 3: 배운 지표로 저평가 우량주 1초 모의 매수 퀘스트 */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900 to-emerald-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {isEn ? '🎯 Onboarding Quest' : '🎯 신규 온보딩 퀘스트'}
                </span>
                <span className="text-xs font-bold text-white">
                  {isEn ? 'Test Your Skills: 1-Second Paper Trade' : '저평가 우량주 모의 매수 체험'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {isEn
                  ? 'Try a fictional stock-selection exercise with 10,000 practice points. No WLD or real stock is credited.'
                  : '가상의 PER·PBR 수치로 연습용 종목을 선택해 보세요. 연습 포인트 10,000점은 WLD가 아니며 실제 지급되지 않습니다.'}
              </p>
            </div>

            <Button
              onClick={() => setMockModalOpen(true)}
              className="min-h-11 shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Coins className="size-3.5 mr-1.5" />
              {isEn ? 'Start Stock Selection Practice' : '모의 매수 연습 시작'}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* 모의 매수 온보딩 팝업 다이얼로그 */}
      <Dialog open={mockModalOpen} onOpenChange={setMockModalOpen}>
        <DialogContent className="max-w-md border-slate-800 bg-slate-900 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-amber-500/40 text-amber-300 text-xs">
                {isEn ? '10,000 Practice Points (Not WLD)' : '연습 포인트 10,000점 (WLD 아님)'}
              </Badge>
              <span className="text-xs text-slate-400">
                {isEn ? 'Onboarding Quest' : '온보딩 모의 퀘스트'}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-white mt-1">
              {isEn ? 'First Purchase in Paper Portfolio' : '저평가 가치주 모의 포트폴리오 첫 매수'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300">
              {isEn
                ? 'Select a fictional stock to practice reading valuation ratios. This does not place an order or alter any account.'
                : '아래 연습용 가상 종목에서 PER·PBR을 비교해 선택해 보세요. 주문은 접수되지 않으며 계좌가 변경되지 않습니다.'}
            </DialogDescription>
          </DialogHeader>

          {purchaseSuccess ? (
            <div role="status" aria-live="polite" className="py-6 text-center space-y-3">
              <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-300">
                  <Coins className="size-3" />
                  <span>
                    {isEn ? 'Practice complete — no reward issued' : '연습 완료 — 보상 지급 없음'}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">
                  {isEn ? 'Practice selection completed' : '연습 종목 선택 완료'}
                </h4>
                <p className="text-xs text-slate-300">
                  {isEn ? (
                    <>
                      Practiced selecting <span className="text-amber-400 font-bold">{selectedStock}</span>. No order was placed and no WLD was credited.
                    </>
                  ) : (
                    <>
                      <span className="text-amber-400 font-bold">{selectedStock}</span> 종목을 연습으로 선택했습니다. 실제 WLD는 지급되지 않으며 주문·보유 내역은 변경되지 않습니다.
                    </>
                  )}
                </p>
              </div>
              <div className="pt-3 flex items-center gap-2">
                <Button asChild className="flex-1 min-h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                  <Link href="/stocks">{isEn ? 'View Real Virtual Stock Listings' : '실제 가상 주식 목록 보기'}</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPurchaseSuccess(false);
                    setMockModalOpen(false);
                  }}
                  className="px-3 border-slate-700 text-slate-300 text-xs hover:bg-slate-800 cursor-pointer"
                >
                  {isEn ? 'Close' : '닫기'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                {[
                  {
                    symbol: 'CHIPS',
                    name: isEn ? 'Chimp Semi' : '침팬지 반도체',
                    per: isEn ? '8.4x' : '8.4배',
                    pbr: isEn ? '0.9x' : '0.9배',
                    desc: isEn ? 'AI chipset pure-play, deep value' : 'AI 칩셋 수혜 저평가 대표주',
                  },
                  {
                    symbol: 'GOLD',
                    name: isEn ? 'Golden Duck Holdings' : '골든덕 홀딩스',
                    per: isEn ? '6.2x' : '6.2배',
                    pbr: isEn ? '0.7x' : '0.7배',
                    desc: isEn ? 'Extreme asset discount conglomerate' : '자산 대비 극심한 저평가 지주사',
                  },
                  {
                    symbol: 'DUCKS',
                    name: isEn ? 'Woldeok Industries' : '월덕 인더스트리',
                    per: isEn ? '9.1x' : '9.1배',
                    pbr: isEn ? '1.0x' : '1.0배',
                    desc: isEn ? 'Reliable quarterly dividend blue-chip' : '안정적 분기 배당 우량주',
                  },
                ].map((s) => (
                  <button
                    key={s.symbol}
                    type="button"
                    onClick={() => setSelectedStock(s.symbol)}
                    className={`w-full min-h-11 p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedStock === s.symbol
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{s.name} ({s.symbol})</span>
                        <span className="text-[10px] text-emerald-400 font-mono">PER {s.per} · PBR {s.pbr}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                    {selectedStock === s.symbol && (
                      <span className="size-2 rounded-full bg-amber-400 shrink-0"></span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isEn ? 'Practice Budget' : '연습 예산'}</span>
                  <span className="font-mono font-bold text-amber-400">
                    {isEn ? '10,000 practice points' : '연습 포인트 10,000점'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isEn ? 'Account Effect' : '계좌 반영'}</span>
                  <span className="font-mono text-emerald-400">
                    {isEn ? 'None (practice only)' : '없음 (연습 전용)'}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setPurchaseSuccess(true)}
                className="w-full min-h-11 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                {isEn ? 'Complete Practice Selection' : '연습 주문 완료하기'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}