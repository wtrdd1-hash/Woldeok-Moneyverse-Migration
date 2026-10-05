import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Landmark, Info, HelpCircle, ShieldCheck, CheckCircle2, TrendingDown } from 'lucide-react';
import { PSEO_LOAN_PRESETS, getLoanPresetBySlug } from '@/config/pseo-loan.config';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { canonicalUrl } from '@/lib/seo';

interface Props {
  params: Promise<{ preset: string }>;
}

export async function generateStaticParams() {
  return PSEO_LOAN_PRESETS.map((p) => ({
    preset: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { preset: slug } = await params;
  const preset = getLoanPresetBySlug(slug);

  if (!preset) {
    return { title: '대출이자 계산기 | 월덕 머니버스' };
  }

  const title = `${preset.title} - 월 상환액 및 총 이자 계산기`;
  const description = `${preset.description} 2026년 최신 은행 금리 기준 원리금균등 및 원금균등 월 상환액을 즉시 비교하세요.`;

  return {
    title,
    description,
    keywords: [preset.title, '대출이자 계산기', '주택담보대출 이자', '원리금균등상환', '신용대출 월 상환액'],
    alternates: {
      canonical: canonicalUrl(`/tools/loan-interest-calculator/${preset.slug}`),
      languages: {
        'ko-KR': canonicalUrl(`/tools/loan-interest-calculator/${preset.slug}`),
        'en-US': canonicalUrl(`/en/tools/loan-interest-calculator/${preset.slug}`),
        'ja-JP': canonicalUrl(`/ja/tools/loan-interest-calculator/${preset.slug}`),
        'zh-CN': canonicalUrl(`/zh/tools/loan-interest-calculator/${preset.slug}`),
        'x-default': canonicalUrl(`/tools/loan-interest-calculator/${preset.slug}`),
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl(`/tools/loan-interest-calculator/${preset.slug}`),
    },
  };
}

export default async function LoanPresetPage({ params }: Props) {
  const { preset: slug } = await params;
  const preset = getLoanPresetBySlug(slug);

  if (!preset) {
    notFound();
  }

  // 계산 로직
  const P = preset.loanAmount;
  const n = preset.termYears * 12;
  const r = preset.annualRate / 100 / 12;

  // 원리금균등
  const monthlyEqualPi = Math.round((P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1));
  const totalRepayEqualPi = monthlyEqualPi * n;
  const totalInterestEqualPi = totalRepayEqualPi - P;

  // 원금균등
  const monthlyPrincipal = Math.floor(P / n);
  let totalInterestEqualP = 0;
  let firstMonthEqualP = 0;
  for (let month = 1; month <= n; month++) {
    const remainingBalance = P - monthlyPrincipal * (month - 1);
    const interest = Math.round(remainingBalance * r);
    totalInterestEqualP += interest;
    if (month === 1) firstMonthEqualP = monthlyPrincipal + interest;
  }
  const totalRepayEqualP = P + totalInterestEqualP;

  // 만기일시
  const monthlyBulletInterest = Math.round(P * r);
  const totalInterestBullet = monthlyBulletInterest * n;

  const currentInterest = preset.repaymentType === 'EQUAL_P' ? totalInterestEqualP : totalInterestEqualPi;
  const currentMonthly = preset.repaymentType === 'EQUAL_P' ? firstMonthEqualP : monthlyEqualPi;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: preset.title,
    description: preset.description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
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
            href="/tools/loan-interest-calculator"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>대출이자 계산기 메인으로</span>
          </Link>
          <span className="text-xs text-zinc-500 font-mono">PSEO-LOAN-{preset.slug.toUpperCase()}</span>
        </div>

        {/* 헤더 */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Landmark className="w-3.5 h-3.5" />
            <span>2026년 시중은행 금리 기준 정밀 시뮬레이션</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {preset.title}
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {preset.description}
          </p>
        </div>

        {/* 상단 고단가 인아티클 광고 */}
        <div className="my-6">
          <InArticleAdvertisement />
        </div>

        {/* 핵심 메트릭 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* 주요 수치 요약 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-5">
            <div>
              <span className="text-xs text-zinc-400 font-medium block mb-1">
                {preset.repaymentType === 'EQUAL_P' ? '첫 달 상환액 (원금+이자)' : '매월 납입 원리금'}
              </span>
              <div className="text-3xl font-mono font-bold text-emerald-400 mb-1">
                {currentMonthly.toLocaleString()}원
              </div>
              <span className="text-xs text-zinc-500">
                대출 원금 {(P / 100000000).toFixed(1)}억원 · {preset.termYears}년 ({preset.termYears * 12}개월) · 연 {preset.annualRate}%
              </span>
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">총 납부 대출이자:</span>
                <span className="font-mono text-rose-400 font-bold">{currentInterest.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">원금 + 이자 총 상환액:</span>
                <span className="font-mono text-zinc-200 font-semibold">{(P + currentInterest).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">월 평균 이자 비용:</span>
                <span className="font-mono text-zinc-400">{Math.round(currentInterest / n).toLocaleString()}원</span>
              </div>
            </div>

            <div className="pt-2">
              <CalculatorSaveAction
                scenario={{
                  type: 'stock',
                  title: preset.title,
                  badge: preset.repaymentType === 'EQUAL_P' ? '원금균등' : '원리금균등',
                  primaryMetric: {
                    label: '월 상환액',
                    value: `${currentMonthly.toLocaleString()}원`,
                  },
                  secondaryMetric: {
                    label: '총 대출이자',
                    value: `${currentInterest.toLocaleString()}원`,
                  },
                  details: {
                    대출원금: `${(P / 10000).toLocaleString()}만원`,
                    연금리: `${preset.annualRate}%`,
                    대출기간: `${preset.termYears}년`,
                    총상환액: `${(P + currentInterest).toLocaleString()}원`,
                  },
                  sourceUrl: `/tools/loan-interest-calculator/${preset.slug}`,
                }}
              />
            </div>
          </div>

          {/* 3가지 상환 방식 비교 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              상환 방식별 총이자 비교
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-emerald-400 block">원금균등 (최저 이자)</span>
                  <span className="text-[11px] text-zinc-500">매달 원금을 동일하게 갚아 이자 절감</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-400 font-bold block">{totalInterestEqualP.toLocaleString()}원</span>
                  <span className="text-[10px] text-emerald-500">원리금 대비 -{(totalInterestEqualPi - totalInterestEqualP).toLocaleString()}원</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-zinc-200 block">원리금균등 (일정 지출)</span>
                  <span className="text-[11px] text-zinc-500">매달 갚는 금액이 같아 예산 관리 용이</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-zinc-200 font-bold block">{totalInterestEqualPi.toLocaleString()}원</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-rose-400 block">만기일시 (초기 부담 최저)</span>
                  <span className="text-[11px] text-zinc-500">이자만 내다 만기에 원금 일시 상환</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-rose-400 font-bold block">{totalInterestBullet.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3년 경과 시 시중은행 중도상환수수료는 전액 면제됩니다.</span>
            </div>
          </div>
        </div>

        {/* 중간 멀티플렉스 고단가 광고 */}
        <div className="my-10">
          <MultiplexAdvertisement />
        </div>

        {/* 연관 인기 대출 프리셋 그리드 */}
        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">
            금액별 인기 대출이자 계산기 바로가기
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PSEO_LOAN_PRESETS.filter((p) => p.slug !== preset.slug).slice(0, 12).map((p) => (
              <Link
                key={p.slug}
                href={`/tools/loan-interest-calculator/${p.slug}`}
                className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/40 hover:border-emerald-500/50 hover:bg-zinc-800/80 transition-all text-xs group"
              >
                <div className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                  {p.title}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1 truncate">
                  대출 {(p.loanAmount / 100000000).toFixed(1)}억 · {p.termYears}년 · 연 {p.annualRate}%
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 법적 면책 */}
        <div className="mt-8 pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>본 계산기는 모의 시뮬레이션용이며, 실제 금융기관의 대출 약정에 따라 차이가 발생할 수 있습니다.</span>
        </div>
      </div>
    </div>
  );
}
