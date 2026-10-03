import React from 'react';
import type { Metadata } from 'next';
import { RoadmapView } from './roadmap-view';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '초반·중반·후반 실전 성장 로드맵 | 실제 화면 영상 시뮬레이터 & 완벽 입문 가이드',
  description: '머니버스 처음 시작자부터 억대 건물주까지! 1일차 럭키 룰렛 시드 모으기부터 7일차 복리·주식 굴리기, 30일차 가상 부동산 패시브 임대료 수령까지 실제 작동 영상과 단계별 가이드로 3분 만에 마스터하세요.',
  keywords: [
    '머니버스 초보자 가이드',
    '머니버스 하는법',
    '머니버스 공략',
    '가상 주식 하는법',
    '복리 예금 이자 수령법',
    '가상 부동산 분양 공략',
  ],
  alternates: {
    canonical: 'https://easy-scraping.com/roadmap',
    languages: {
      'ko-KR': 'https://easy-scraping.com/roadmap',
      'en-US': 'https://easy-scraping.com/en/roadmap',
      'ja-JP': 'https://easy-scraping.com/ja/roadmap',
      'zh-CN': 'https://easy-scraping.com/zh/roadmap',
      'x-default': 'https://easy-scraping.com/roadmap',
    },
  },
  openGraph: {
    title: '머니버스 초반·중반·후반 실전 성장 로드맵 & 비디오 시뮬레이터',
    description: '무자본 시드머니부터 가상 부동산 건물주까지! 실제 화면 영상과 단계별 튜토리얼로 3분 만에 마스터하세요.',
    url: 'https://easy-scraping.com/roadmap',
    siteName: 'Woldeok Moneyverse',
    locale: 'ko_KR',
    type: 'article',
  },
};

export default function RoadmapPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: '머니버스 초반·중반·후반 실전 성장 및 플레이 방법 3단계 완벽 가이드',
    description: '1일차 시드머니 형성부터 7일차 복리 주식 투자, 30일차 가상 부동산 건물주 등극까지의 실전 공략 로드맵',
    step: [
      {
        '@type': 'HowToStep',
        name: '초반 1~3일차: 무자본 종잣돈 10만 WLD 시드 모으기',
        text: '일일 무료 럭키 룰렛 스핀과 인턴 직업 업무 수행, 웰컴 퀘스트 3종 보상을 통해 종잣돈 10만 WLD를 형성합니다.',
        url: 'https://easy-scraping.com/casino',
      },
      {
        '@type': 'HowToStep',
        name: '중반 4~14일차: 복리 예금과 주식 분할 매수로 1,000만 WLD 굴리기',
        text: '중앙은행 30일 스마트 복리 포켓(연 7.2%)에 시드 50%를 예치하고, 나머지 50%로 WDX 대장주를 10-Depth 호가창에서 분할 매수합니다.',
        url: 'https://easy-scraping.com/bank',
      },
      {
        '@type': 'HowToStep',
        name: '후반 15~30일차+: 가상 부동산 건물주 & 패시브 임대료 제국 완성',
        text: '강남·판교 8대 상권 가상 랜드/오피스를 분양받아 소유하고, 매일 자정에 자동으로 입금되는 패시브 임대료를 수령하며 프레스티지 환생을 달성합니다.',
        url: 'https://easy-scraping.com/spaces/real-estate',
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
        <RoadmapView />
      </div>
    </>
  );
}
