import React from 'react';
import type { Metadata } from 'next';
import { FeaturesView } from './features-view';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '핵심 기능 & 사용법 가이드 | 6대 가상 경제 기능 예시와 실제 서비스 이동',
  description: '가상 주식, 은행, 직업, 부동산, 계산기, 아케이드의 예시 화면을 살펴보고 실제 서비스로 이동하세요. 예시 금액과 버튼은 실제 거래·보상·계정 데이터가 아닙니다.',
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
    description: '가상 경제 기능 6종의 정적인 예시 화면과 실제 서비스 이동 링크를 확인하세요. 예시 값은 거래 내역이 아닙니다.',
    url: 'https://easy-scraping.com/features',
    siteName: 'Woldeok Moneyverse',
    locale: 'ko_KR',
    type: 'article',
  },
};

export default function FeaturesPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Woldeok Moneyverse virtual economy feature guide',
    description: 'Static illustrative previews with links to existing virtual-economy service pages; examples are not transactions or account data.',
    itemListElement: [
      ['/stocks', 'Virtual stock exchange'],
      ['/bank', 'Virtual bank'],
      ['/work', 'Virtual jobs'],
      ['/spaces/real-estate', 'Virtual real estate'],
      ['/tools', 'Financial calculators'],
      ['/arcade', 'Virtual arcade'],
    ].map(([path, name], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      url: `https://easy-scraping.com${path}`,
    })),
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
