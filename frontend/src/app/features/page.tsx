import React from 'react';
import type { Metadata } from 'next';
import { FeaturesView } from './features-view';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '핵심 기능 & 사용법 가이드 | 실제 화면으로 보는 6대 핀테크 가상 경제 조작법',
  description: 'WDX 가상 주식 거래소, 중앙은행 스마트 복리 포켓, 직업 파밍, 부동산 메가시티, 5대 금융 계산기 등 머니버스의 모든 핵심 기능과 조작법을 실제 화면 스크린샷과 단계별 가이드로 1분 만에 마스터하세요.',
  keywords: [
    '머니버스 기능 소개',
    '가상 주식 거래소 사용법',
    '복리 예금 이자 수령',
    '가상 부동산 분양 방법',
    '직업 파밍 가이드',
    '금융 계산기 조작법',
  ],
  alternates: {
    canonical: 'https://easy-scraping.com/features',
    languages: {
      'ko-KR': 'https://easy-scraping.com/features',
      'en-US': 'https://easy-scraping.com/en/features',
      'ja-JP': 'https://easy-scraping.com/ja/features',
      'zh-CN': 'https://easy-scraping.com/zh/features',
      'x-default': 'https://easy-scraping.com/features',
    },
  },
  openGraph: {
    title: '머니버스 핵심 기능 & 1분 완벽 조작 가이드',
    description: '실제 화면 스크린샷과 단계별 가이드로 6대 핀테크 가상 경제 시스템을 한눈에 마스터하세요.',
    url: 'https://easy-scraping.com/features',
    siteName: 'Woldeok Moneyverse',
    locale: 'ko_KR',
    type: 'article',
  },
};

export default function FeaturesPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: '2026 머니버스 6대 핀테크 가상 경제 핵심 기능 완벽 조작 가이드',
    description: '가상 주식 매매, 복리 예금, 직업 파밍, 가상 부동산 랜드 분양, 5대 금융 계산기 사용법',
    step: [
      {
        '@type': 'HowToStep',
        name: '가상 주식 거래소에서 관심 종목 매수',
        text: '10-Depth 실시간 호가창을 분석하고 지정가/시장가 주문으로 주식을 매수합니다.',
        url: 'https://easy-scraping.com/stocks',
      },
      {
        '@type': 'HowToStep',
        name: '중앙은행 스마트 복리 포켓 개설',
        text: '여유 자금을 예치하고 매일 자정에 원리금에 붙는 일일 복리 이자를 수령합니다.',
        url: 'https://easy-scraping.com/bank',
      },
      {
        '@type': 'HowToStep',
        name: '직업 선택 및 일일 파밍 루틴 수행',
        text: '전문 직업을 선택하여 업무를 수행하고 기본 급여와 숙련도 보너스를 획득합니다.',
        url: 'https://easy-scraping.com/work',
      },
      {
        '@type': 'HowToStep',
        name: '가상 부동산 메가시티 랜드 분양 및 임대료 수령',
        text: '강남, 여의도, 판교 등 핵심 상권 부지를 소유하고 매일 패시브 임대료를 정산받습니다.',
        url: 'https://easy-scraping.com/spaces/real-estate',
      },
      {
        '@type': 'HowToStep',
        name: '5대 금융 계산기로 수익률 진단 및 SNS 공유',
        text: '물타기, 복리, 부동산 월세, 김프, 양도세 계산기를 활용해 진단하고 1초 바이럴 카드를 공유합니다.',
        url: 'https://easy-scraping.com/tools',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FeaturesView />
      </div>
    </>
  );
}
