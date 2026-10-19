import type { Metadata } from 'next';
import {
  canonicalUrl,
  breadcrumbJsonLd,
  faqPageJsonLd,
  softwareApplicationJsonLd,
} from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '코인 스테이킹 APY 복리 계산기 — [무료] DeFi APR ↔ APY 변환 & 일/월 복리 이자 즉시 산출 | 월덕 머니버스',
  description:
    '[로그인 없이 1초 변환] 암호화폐 스테이킹 및 DeFi 유동성 풀의 명목 APR(단리)을 실질 APY(복리)로 즉시 환산! 일복리·월복리·블록 단위 자동 재투자 만기 수익률 정밀 시뮬레이터.',
  keywords: [
    '코인 스테이킹 계산기',
    '스테이킹 apy 계산기',
    'apr apy 변환기',
    'defi 이자 계산기',
    '코인 복리 계산기',
    '스테이킹 수익률 계산',
    '암호화폐 dca 계산기',
    '가상자산 복리이자',
  ],
  alternates: {
    canonical: canonicalUrl('/tools/crypto-apy-calculator'),
    languages: {
      'ko-KR': canonicalUrl('/tools/crypto-apy-calculator'),
      'en-US': canonicalUrl('/en/tools/crypto-apy-calculator'),
      'ja-JP': canonicalUrl('/ja/tools/crypto-apy-calculator'),
      'zh-CN': canonicalUrl('/zh/tools/crypto-apy-calculator'),
      'x-default': canonicalUrl('/tools/crypto-apy-calculator'),
    },
  },
  openGraph: {
    title: '코인 스테이킹 APY 복리 계산기 — DeFi APR ↔ APY 변환기 | 월덕 머니버스',
    description: '암호화폐 스테이킹과 DeFi 유동성 공급 시 실질 복리 수익률(APY) 및 DCA 적립 효과 즉시 시뮬레이션',
    url: canonicalUrl('/tools/crypto-apy-calculator'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '코인 스테이킹 APY 복리 계산기 — [무료] DeFi APR ↔ APY 변환기 | 월덕 머니버스',
    description: '암호화폐 스테이킹 및 DeFi 복리 이자 실시간 정밀 계산기',
  },
};

const BREADCRUMB_SCHEMA = breadcrumbJsonLd([
  { name: '홈', path: '/' },
  { name: '금융 도구 허브', path: '/tools' },
  { name: '코인 스테이킹 APY 복리 계산기', path: '/tools/crypto-apy-calculator' },
]);

const FAQ_SCHEMA = faqPageJsonLd([
  {
    question: 'APR(단리)과 APY(복리)의 차이는 무엇인가요?',
    answer:
      'APR(Annual Percentage Rate)은 이자가 재투자되지 않는 연간 명목 단리 이자율이며, APY(Annual Percentage Yield)는 발생한 이자가 원금에 합산되어 다시 이자를 낳는 연간 유효 복리 이자율입니다. 재투자 주기가 짧을수록 APY는 APR보다 훨씬 높아집니다.',
  },
  {
    question: '일복리와 블록 단위 복리의 차이는 얼마나 나나요?',
    answer:
      '대부분의 DeFi 프로토콜은 실시간 블록 또는 초 단위로 보상을 지급하므로 일복리보다 미세하게 높은 수익률을 기록합니다. 이 계산기는 일복리, 주복리, 월복리, 블록 단위 복리를 모두 지원합니다.',
  },
]);

const APP_SCHEMA = softwareApplicationJsonLd({
  name: '코인 스테이킹 APY 복리 계산기',
  description: '암호화폐 스테이킹 및 DeFi 유동성 풀 APR/APY 상호 변환 및 복리 수익률 실시간 시뮬레이터',
  urlPath: '/tools/crypto-apy-calculator',
  applicationCategory: 'FinanceApplication',
});

export default function CryptoApyCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(BREADCRUMB_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(FAQ_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(APP_SCHEMA) }}
      />
      {children}
    </>
  );
}
