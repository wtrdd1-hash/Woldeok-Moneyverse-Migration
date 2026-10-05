import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Coins, HelpCircle, Info, PieChart, ShieldCheck } from 'lucide-react';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { DividendCalculatorClient } from './dividend-calculator-client';
import { DividendCalendarWidget } from '@/components/dividend-calendar-widget';
import { DesktopStickyAdRails } from '@/components/desktop-sticky-ad-rails';

export const metadata: Metadata = {

  title: '배당소득세 계산기 - 국내·미국 주식 15.4% 원천징수 및 2천만원 금융종합과세',
  description: '국내 및 미국 주식 배당금의 15.4% 세금 원천징수 실수령액과 2,000만원 초과 시 금융소득종합과세 세부담을 실시간으로 계산하고 절세 전략을 확인하세요.',
  keywords: ['배당소득세 계산기', '배당금 세금', '금융소득종합과세 2000만원', '미국 배당주 세금', '배당 실수령액', 'ISA 계좌 배당 절세'],
  openGraph: {
    title: '배당소득세 및 금융소득종합과세 2,000만원 시뮬레이터',
    description: '배당금에 따른 원천징수 세금과 실수령 배당금, 금융종합과세 해당 여부를 즉시 계산합니다.',
    type: 'website',
  },
};

export default function DividendTaxCalculatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '배당소득세 계산기',
    description: '국내 및 미국 주식 배당금 원천징수 세액 및 2,000만원 금융소득종합과세 계산기',
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
        name: '배당소득이 연간 2,000만원을 넘으면 어떻게 과세되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '이자소득과 배당소득의 합계가 연간 2,000만원을 초과하면 금융소득종합과세 대상자가 되며, 2,000만원 초과분은 다른 종합소득(근로·사업소득 등)과 합산되어 6%~45%의 누진세율이 적용됩니다.',
        },
      },
      {
        '@type': 'Question',
        name: '미국 배당주와 국내 배당주의 세금 차이는 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '국내 주식은 배당소득세 14% + 지방소득세 1.4% = 총 15.4%가 원천징수됩니다. 미국 주식은 한미 조세조약에 따라 미국 현지에서 15%가 원천징수되며, 국내 추가 원천징수는 없습니다. 단, 두 경우 모두 연 2,000만원 합산 한도에 포함됩니다.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <DesktopStickyAdRails />
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
          <span className="text-xs text-zinc-500 font-mono">FIN-CALC-DIVIDEND-V1</span>
        </div>

        {/* 헤더 */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Coins className="w-3.5 h-3.5" />
            <span>2026년 배당소득세 및 금융종합과세 기준</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            배당소득세 계산기 (국내 · 미국주식)
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            원천징수 15.4% 세액과 통장에 입금되는 실수령 배당금, 2,000만원 초과 시 종합과세 부담을 즉시 계산합니다.
          </p>
        </div>

        {/* 상단 고단가 인아티클 광고 */}
        <div className="my-6">
          <InArticleAdvertisement />
        </div>

        {/* 인터랙티브 배당 계산기 클라이언트 컴포넌트 */}
        <DividendCalculatorClient />

        {/* 신규 배당 캘린더 인터랙티브 대시보드 위젯 */}
        <div className="my-8">
          <DividendCalendarWidget />
        </div>

        {/* 중간 멀티플렉스 고단가 광고 */}

        <div className="my-10">
          <MultiplexAdvertisement />
        </div>

        {/* 절세 팁 가이드 */}
        <div className="mt-12 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              배당소득세 절세를 위한 3대 핵심 전략
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="font-semibold text-zinc-200 block mb-1">1. 중개형 ISA 계좌 활용</span>
                배당소득에 대해 일반형 최대 200만원, 서민형 최대 400만원까지 비과세되며 초과분도 9.9% 분리과세로 종결됩니다.
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="font-semibold text-zinc-200 block mb-1">2. 연금저축/IRP 연계</span>
                배당금을 인출할 때까지 세금이 이연(과세이연)되며, 추후 연금 수령 시 3.3%~5.5%의 저율 연금소득세만 납부합니다.
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="font-semibold text-zinc-200 block mb-1">3. 부부 증여 및 명의 분산</span>
                금융소득종합과세 기준 2,000만원은 개인별로 산정되므로 배우자 증여(10년 6억원 공제)를 통해 자산을 분산합니다.
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
                <h4 className="font-semibold text-zinc-200 mb-1">Q. 배당락일과 배당금 지급일은 어떻게 다른가요?</h4>
                <p className="text-zinc-400 leading-relaxed">
                  배당기준일 2영업일 전까지 주식을 매수해야 배당을 받을 권리가 주어집니다. 권리가 사라지는 날이 배당락일이며, 실제 배당금이 증권계좌로 입금되는 날은 주주총회 결의 후 1~2개월 뒤 지급됩니다.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-800">
                <h4 className="font-semibold text-zinc-200 mb-1">Q. 건강보험료 피부양자 자격 탈락 기준은 얼마인가요?</h4>
                <p className="text-zinc-400 leading-relaxed">
                  연간 합산 금융소득(이자+배당)이 1,000만원을 초과하거나 종합소득이 2,000만원을 초과하는 경우 국민건강보험 피부양자 자격이 박탈되어 지역가입자로 전환될 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 법적 고지 */}
        <div className="mt-8 pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>본 계산기는 모의 시뮬레이션용이며, 실제 세액은 개인별 타 소득 및 국세청 확정신고 기준에 따라 상이할 수 있습니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
