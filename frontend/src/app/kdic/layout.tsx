import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  softwareApplicationJsonLd,
  canonicalUrl,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: '예금보험공사(KDIC) 5천만원 예금자보호 포털 | 월덕 금융안전망',
  description:
    '대한민국 예금자보호법 제31조 공식 적용. 1인당 최고 5,000만원(500,000 WLD) 원리금 전액 보장, 부보 금융기관 BIS 비율 및 건전성 등급 실시간 공시 포털.',
  alternates: {
    canonical: canonicalUrl('/kdic'),
    languages: {
      'ko-KR': canonicalUrl('/kdic'),
      'en-US': canonicalUrl('/en/kdic'),
      'ja-JP': canonicalUrl('/ja/kdic'),
      'zh-CN': canonicalUrl('/zh/kdic'),
      'x-default': canonicalUrl('/kdic'),
    },
  },
  openGraph: {
    title: '예금보험공사(KDIC) 5천만원 예금자보호 포털',
    description:
      '금융기관이 파산해도 1인당 최고 5,000만원(500,000 WLD)까지 원리금 전액 보호! 내 보호예금 계산기 및 부보 금융기관 건전성 공시.',
    url: canonicalUrl('/kdic'),
    siteName: '월덕 머니버스 (Woldeok Moneyverse)',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '예금보험공사(KDIC) 5천만원 예금자보호 포털',
    description: '1인당 최고 5,000만원 법적 보호 및 부보 금융기관 건전성 실시간 공시.',
  },
};

export default function KdicLayout({ children }: { children: ReactNode }) {
  const faqData = faqPageJsonLd([
    {
      question: '예금자보호 한도는 얼마인가요?',
      answer:
        '예금자보호법 제31조에 의거하여 부보 금융기관별로 1인당 원금과 소정의 이자를 합하여 최고 5,000만원(500,000 WLD)까지 전액 보호됩니다.',
    },
    {
      question: '보호대상 금융상품은 무엇인가요?',
      answer:
        '월덕 가상은행의 정기예금, 복리적금, 스마트 복리 포켓이 보호대상이며, 가상 주식 및 파생상품은 실적배당 상품으로 보호대상에서 제외됩니다.',
    },
    {
      question: '금융기관이 파산하거나 영업정지되면 어떻게 지급받나요?',
      answer:
        '예금보험공사의 대위변제 절차를 통해 중앙은행(MINT) 원천 계좌로부터 피해 예금자의 지갑으로 복식부기 원장 분개를 통해 보호금액이 자동 입금됩니다.',
    },
  ]);

  const appData = softwareApplicationJsonLd({
    name: 'KDIC 5천만원 예금자보호 시뮬레이터',
    description:
      '내 예금과 발생 이자가 5,000만원(500,000 WLD) 한도 내에서 안전하게 전액 보호되는지 실시간 계산하는 금융안전망 도구.',
    urlPath: '/kdic',
    applicationCategory: 'FinanceApplication',
    features: [
      '1인당 5천만원 한도 실시간 시뮬레이션',
      '부보 금융기관 BIS 자기자본비율 및 건전성 등급 공시',
      '복식부기 대위변제 안전망 연동',
    ],
  });

  const breadcrumbData = breadcrumbJsonLd([
    { name: '홈', path: '' },
    { name: '예금보험공사(KDIC)', path: '/kdic' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      {children}
    </>
  );
}
