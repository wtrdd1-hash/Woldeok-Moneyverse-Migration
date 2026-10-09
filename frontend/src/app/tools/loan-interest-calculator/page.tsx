import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Landmark, Info, HelpCircle, ShieldCheck } from 'lucide-react';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { LoanCalculatorClient } from './loan-calculator-client';

export const metadata: Metadata = {
  title: '대출이자 계산기 - 2억 대출 30년 상환·원리금균등·주택담보대출 월별 상환액 비교',
  description: '2억 대출 30년 상환 시 월 납입금 약 95만 원 및 총 대출이자 1억 4,374만 원 정밀 산출! 1억·2억·3억·5억 주택담보대출, 신용대출의 원리금균등, 원금균등, 만기일시 상환방식별 총 이자와 월 상환액을 한눈에 비교하고 절세 전략을 확인하세요.',
  keywords: [
    '2억 대출 30년 상환',
    '대출이자 계산기',
    '원리금균등상환',
    '원금균등상환',
    '주택담보대출 이자',
    '신용대출 이자',
    '30년 상환 대출이자',
    '만기일시상환',
    '주담대 2억 이자',
    '대출상환 계산기',
  ],
  openGraph: {
    title: '대출이자 계산기 - 2억 대출 30년 상환 월 납입금 & 원리금균등 비교',
    description: '2억 대출 30년 상환(연 4.0% 기준 월 95만원) 및 대출 금액·금리·기간별 총 대출이자와 월별 상환 스케줄을 실시간으로 확인하세요.',
    type: 'website',
  },
};

export default function LoanInterestCalculatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '대출이자 계산기 - 2억 대출 30년 상환 시뮬레이터',
    description: '2억 대출 30년 상환 및 원리금균등, 원금균등, 만기일시 상환 방식별 대출 이자 및 월 상환액 계산 시뮬레이터',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '2억 대출 30년 상환 시 월 납입금과 총 이자는 얼마인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '연 4.0% 금리 기준 2억 원을 30년(360개월) 원리금균등상환할 경우 매월 상환하는 원리금은 약 954,830원이며 30년간 총 대출이자는 약 1억 4,374만 원입니다. 동일 조건으로 원금균등상환 시 첫 달 상환액은 약 1,222,222원으로 높지만 총 이자는 약 1억 2,033만 원으로 약 2,341만 원의 이자를 절약할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '원리금균등상환과 원금균등상환 중 어느 것이 더 유리한가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '총 대출 이자만 비교하면 매월 원금을 더 많이 갚아나가는 원금균등상환이 가장 유리합니다. 하지만 초기 월 상환액 부담이 크므로, 매달 일정한 지출 관리를 원하신다면 원리금균등상환이 적합합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '중도상환수수료는 언제까지 발생하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '대부분의 시중은행 주택담보대출 및 신용대출은 대출 실행 후 3년이 지나면 중도상환수수료가 전액 면제됩니다.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* 상단 내비게이션 */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>금융 계산기 목록으로</span>
          </Link>
          <span className="text-xs text-zinc-500 font-mono">FIN-CALC-LOAN-V1</span>
        </div>

        {/* 헤더 */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Landmark className="w-3.5 h-3.5" />
            <span>2026년 최신 은행 기준 금리 완벽 반영</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            대출이자 계산기 (원리금균등 · 원금균등)
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            대출 금액, 연 금리, 상환 기간에 따른 월별 상환금액과 총 이자를 즉시 비교 계산합니다.
          </p>
        </div>

        {/* 상단 고단가 인아티클 광고 */}
        <div className="my-6">
          <InArticleAdvertisement />
        </div>

        {/* 인터랙티브 계산기 클라이언트 컴포넌트 */}
        <LoanCalculatorClient />

        {/* 중간 멀티플렉스 고단가 광고 */}
        <div className="my-10">
          <MultiplexAdvertisement />
        </div>

        {/* 안내 및 절세 가이드 */}
        <div className="mt-12 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              대출 상환 방식 3가지 핵심 비교
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="font-semibold text-zinc-200 block mb-1">1. 원리금균등상환</span>
                매달 납부하는 원금과 이자의 합계가 동일합니다. 매월 일정한 지출 예산 관리가 가능해 가장 많이 선택합니다.
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="font-semibold text-zinc-200 block mb-1">2. 원금균등상환</span>
                매달 원금을 똑같이 나누어 갚으므로, 시간이 지날수록 이자가 줄어듭니다. 총 대출 이자가 가장 적습니다.
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="font-semibold text-zinc-200 block mb-1">3. 만기일시상환</span>
                대출 기간 동안 이자만 납부하다 만기에 원금을 전액 상환합니다. 초기 부담은 적으나 총 이자가 가장 많습니다.
              </div>
            </div>
          </div>

          {/* 자주 묻는 질문 FAQ */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              자주 묻는 질문 (FAQ)
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-zinc-200 mb-1">Q. 주택담보대출 이자 소득공제 혜택은 어떻게 되나요?</h4>
                <p className="text-zinc-400 leading-relaxed">
                  무주택 또는 1주택 세대주가 취득 당시 기준시가 6억원 이하의 주택을 구입하기 위해 만기 15년 이상의 장기주택저당차입금을 이용하는 경우, 상환 방식에 따라 연간 최대 2,000만원 한도로 이자 상환액 전액을 근로소득에서 공제받을 수 있습니다.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-800">
                <h4 className="font-semibold text-zinc-200 mb-1">Q. 금리인하요구권은 언제 신청할 수 있나요?</h4>
                <p className="text-zinc-400 leading-relaxed">
                  취업, 승진, 급여 인상, 신용점수 상승, 부채 감소 등 신용 상태가 개선된 경우 은행에 언제든 금리 인하를 요구할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 법적 고지 */}
        <div className="mt-8 pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>본 계산기는 모의 시뮬레이션용이며, 실제 금융기관의 대출 실행 시점 및 세부 약정에 따라 차이가 발생할 수 있습니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
