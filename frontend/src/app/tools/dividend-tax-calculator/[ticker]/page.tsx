import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Coins, Calendar, PieChart, ShieldCheck, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { PSEO_DIVIDEND_STOCKS, getDividendStockByTicker } from '@/config/pseo-dividend.config';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { canonicalUrl } from '@/lib/seo';

interface Props {
  params: Promise<{ ticker: string }>;
}

export async function generateStaticParams() {
  return PSEO_DIVIDEND_STOCKS.map((s) => ({
    ticker: s.ticker.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const stock = getDividendStockByTicker(ticker);

  if (!stock) {
    return { title: '배당소득세 계산기 | 월덕 머니버스' };
  }

  const title = `${stock.nameKo}(${stock.ticker}) 배당금·배당락일·15.4% 세후 실수령액 계산기`;
  const description = `${stock.nameKo} 배당수익률 ${stock.dividendYield}%, 연간 배당금 ${stock.annualDividend}${stock.currency}, 배당주기(${stock.frequency}) 및 15.4% 세금 공제 후 실제 통장 입금액을 실시간으로 확인하세요.`;

  return {
    title,
    description,
    keywords: [
      `${stock.nameKo} 배당금`,
      `${stock.ticker} 배당락일`,
      `${stock.nameKo} 배당수익률`,
      `${stock.nameKo} 배당세율`,
      '미국 배당주 세금',
      '배당소득세 계산기',
    ],
    alternates: {
      canonical: canonicalUrl(`/tools/dividend-tax-calculator/${stock.ticker.toLowerCase()}`),
      languages: {
        'ko-KR': canonicalUrl(`/tools/dividend-tax-calculator/${stock.ticker.toLowerCase()}`),
        'en-US': canonicalUrl(`/en/tools/dividend-tax-calculator/${stock.ticker.toLowerCase()}`),
        'ja-JP': canonicalUrl(`/ja/tools/dividend-tax-calculator/${stock.ticker.toLowerCase()}`),
        'zh-CN': canonicalUrl(`/zh/tools/dividend-tax-calculator/${stock.ticker.toLowerCase()}`),
        'x-default': canonicalUrl(`/tools/dividend-tax-calculator/${stock.ticker.toLowerCase()}`),
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl(`/tools/dividend-tax-calculator/${stock.ticker.toLowerCase()}`),
    },
  };
}

export default async function DividendStockPage({ params }: Props) {
  const { ticker } = await params;
  const stock = getDividendStockByTicker(ticker);

  if (!stock) {
    notFound();
  }

  // 환율 기준 (USD인 경우 약 1,350원 기준 계산 병행)
  const isUSD = stock.currency === 'USD';
  const usdRate = 1350;
  const taxRate = stock.country === 'US' ? 0.15 : 0.154; // 미국 15%, 국내 15.4%

  const annualDivPerShare = stock.annualDividend;
  const taxPerShare = annualDivPerShare * taxRate;
  const netDivPerShare = annualDivPerShare - taxPerShare;

  // 100주, 500주, 1,000주 시뮬레이션
  const tiers = [10, 100, 500, 1000];

  // 2,000만원 종합과세 도달을 위한 필요 주식 수
  const sharesFor20M = isUSD
    ? Math.ceil(20000000 / (annualDivPerShare * usdRate))
    : Math.ceil(20000000 / annualDivPerShare);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `${stock.nameKo} (${stock.ticker}) 배당금 분석`,
    description: `${stock.nameKo} 배당수익률 ${stock.dividendYield}% 및 세후 실수령액 시뮬레이터`,
    feesAndCommissionsSpecification: '배당소득세 원천징수 15.4%',
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/tools/dividend-tax-calculator"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>배당소득세 계산기 메인으로</span>
          </Link>
          <span className="text-xs text-zinc-500 font-mono">DIVIDEND-{stock.ticker}</span>
        </div>

        {/* 헤더 */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <Coins className="w-3.5 h-3.5" />
            <span>{stock.country === 'US' ? '미국 주식 현지 원천징수 15%' : '국내 주식 15.4% 원천징수'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {stock.nameKo} ({stock.ticker}) 배당금 & 세후 실수령액
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {stock.nameEn} · 연 배당수익률 {stock.dividendYield}% · 배당주기 {stock.frequency}배당 ({stock.exDividendDate})
          </p>
        </div>

        {/* 상단 고단가 인아티클 광고 */}
        <div className="my-6">
          <InArticleAdvertisement />
        </div>

        {/* 핵심 메트릭 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* 1주당 세후 실수령 요약 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-5">
            <div>
              <span className="text-xs text-zinc-400 font-medium block mb-1">
                1주당 연간 세후 실수령 배당금
              </span>
              <div className="text-3xl font-mono font-bold text-emerald-400 mb-1">
                {isUSD ? `$${netDivPerShare.toFixed(2)}` : `${Math.floor(netDivPerShare).toLocaleString()}원`}
                {isUSD && (
                  <span className="text-sm font-normal text-zinc-400 ml-2">
                    (약 {Math.floor(netDivPerShare * usdRate).toLocaleString()}원)
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-500">
                세전 {stock.annualDividend}{isUSD ? '$' : '원'}에서 세금 {(taxRate * 100).toFixed(1)}% 공제 후 실수령
              </span>
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">배당수익률:</span>
                <span className="font-mono text-emerald-400 font-bold">{stock.dividendYield}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">배당 주기:</span>
                <span className="font-mono text-zinc-200 font-semibold">{stock.frequency}배당 ({stock.exDividendDate})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">2천만원 종합과세 기준 주식 수:</span>
                <span className="font-mono text-amber-400 font-semibold">{sharesFor20M.toLocaleString()}주 이상</span>
              </div>
            </div>

            <div className="pt-2">
              <CalculatorSaveAction
                scenario={{
                  type: 'stock',
                  title: `${stock.nameKo} (${stock.ticker}) 배당금`,
                  badge: `${stock.dividendYield}% 배당`,
                  primaryMetric: {
                    label: '1주 세후배당',
                    value: isUSD ? `$${netDivPerShare.toFixed(2)}` : `${Math.floor(netDivPerShare).toLocaleString()}원`,
                  },
                  secondaryMetric: {
                    label: '배당주기',
                    value: stock.frequency,
                  },
                  details: {
                    종목코드: stock.ticker,
                    국가: stock.country,
                    세전배당: `${stock.annualDividend}${isUSD ? '$' : '원'}`,
                    배당수익률: `${stock.dividendYield}%`,
                    배당락기준: stock.exDividendDate,
                  },
                  sourceUrl: `/tools/dividend-tax-calculator/${stock.ticker.toLowerCase()}`,
                }}
              />
            </div>
          </div>

          {/* 보유 수량별 연간 실수령액 표 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              보유 수량별 연간 실수령 배당금
            </h3>

            <div className="space-y-2.5 text-xs">
              {tiers.map((qty) => {
                const totalGross = qty * annualDivPerShare;
                const totalNet = qty * netDivPerShare;
                const totalNetKrw = isUSD ? totalNet * usdRate : totalNet;

                return (
                  <div key={qty} className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-zinc-200 block">{qty.toLocaleString()}주 보유 시</span>
                      <span className="text-[11px] text-zinc-500">
                        세전 {isUSD ? `$${totalGross.toFixed(1)}` : `${Math.floor(totalGross).toLocaleString()}원`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-emerald-400 font-bold block">
                        {isUSD ? `$${totalNet.toFixed(2)}` : `${Math.floor(totalNet).toLocaleString()}원`}
                      </span>
                      {isUSD && (
                        <span className="text-[10px] text-zinc-400">
                          약 {Math.floor(totalNetKrw).toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ISA 계좌에서 투자 시 최대 200만~400만원까지 비과세 혜택이 적용됩니다.</span>
            </div>
          </div>
        </div>

        {/* 중간 멀티플렉스 고단가 광고 */}
        <div className="my-10">
          <MultiplexAdvertisement />
        </div>

        {/* 다른 인기 배당주 둘러보기 */}
        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">
            다른 인기 고배당주 배당금 계산기 바로가기
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PSEO_DIVIDEND_STOCKS.filter((s) => s.ticker !== stock.ticker).slice(0, 12).map((s) => (
              <Link
                key={s.ticker}
                href={`/tools/dividend-tax-calculator/${s.ticker.toLowerCase()}`}
                className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/40 hover:border-amber-500/50 hover:bg-zinc-800/80 transition-all text-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors truncate">
                    {s.nameKo}
                  </span>
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    {s.dividendYield}%
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-1 truncate">
                  {s.ticker} · {s.frequency}배당 · {s.country}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 법적 면책 */}
        <div className="mt-8 pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>본 계산기는 과거 배당 공시 기준이며, 기업의 이사회 및 실적에 따라 배당금과 배당락일은 변동될 수 있습니다.</span>
        </div>
      </div>
    </div>
  );
}
