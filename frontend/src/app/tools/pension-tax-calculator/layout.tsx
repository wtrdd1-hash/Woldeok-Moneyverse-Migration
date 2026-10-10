import type { Metadata } from 'next';
import {
  canonicalUrl,
  breadcrumbJsonLd,
  faqPageJsonLd,
  softwareApplicationJsonLd,
  buildOgImageUrl,
} from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '연금소득세 & 퇴직소득세 절세 계산기 — 2026 IRP·연금저축 수령액 및 1,500만원 분리과세 | 월덕 머니버스',
  description:
    '연금저축·IRP 연금 수령 시 연령별(3.3%~5.5%) 연금소득세율과 1,500만원 초과 시 종합과세 vs 16.5% 분리과세 비교, 퇴직소득세 30~40% 감면 혜택을 실시간 시뮬레이션하세요.',
  keywords: [
    '연금소득세 계산기',
    '퇴직소득세 계산기',
    'IRP 연금수령 세금',
    '연금저축 1500만원 분리과세',
    '연금 수령 연령별 세율',
    '퇴직금 IRP 이체 절세',
    '사적연금 분리과세 16.5%',
    '연금 실수령액 계산',
  ],
  alternates: {
    canonical: canonicalUrl('/tools/pension-tax-calculator'),
    languages: {
      'ko-KR': canonicalUrl('/tools/pension-tax-calculator'),
      'en-US': canonicalUrl('/en/tools/pension-tax-calculator'),
      'ja-JP': canonicalUrl('/ja/tools/pension-tax-calculator'),
      'zh-CN': canonicalUrl('/zh/tools/pension-tax-calculator'),
      'x-default': canonicalUrl('/tools/pension-tax-calculator'),
    },
  },
  openGraph: {
    title: '연금소득세 & 퇴직소득세 절세 계산기 — IRP·연금저축 수령 시뮬레이터 | 월덕 머니버스',
    description: '연령별 3.3%~5.5% 연금소득세와 1,500만원 초과 분리과세 선택, 퇴직금 절세 효과 실시간 계산',
    url: canonicalUrl('/tools/pension-tax-calculator'),
    type: 'website',
    images: [
      {
        url: buildOgImageUrl({
          title: '연금소득세 & 퇴직소득세 계산기',
          description: '연금저축·IRP 수령액별 3.3%~5.5% 저율과세 및 1,500만원 분리과세',
          badge: 'Pension Tax',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '연금소득세 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '연금소득세 & 퇴직소득세 절세 계산기 — IRP·연금저축 수령 시뮬레이터 | 월덕 머니버스',
    description: '연령별 3.3%~5.5% 연금소득세와 1,500만원 초과 분리과세 선택, 퇴직금 절세 효과 실시간 계산',
  },
};

const FAQS = [
  {
    question: '연금 수령 연령에 따른 연금소득세율은 어떻게 다른가요?',
    answer:
      '만 55세 이상~70세 미만은 5.5%, 만 70세 이상~80세 미만은 4.4%, 만 80세 이상은 3.3%의 저율 연금소득세(지방소득세 포함)가 원천징수됩니다.',
  },
  {
    question: '사적연금 연 1,500만 원 초과 시 세금은 어떻게 과세되나요?',
    answer:
      '연금저축 및 IRP에서 세액공제 받은 원금과 운용수익의 합산 연금 수령액이 연간 1,500만 원을 초과하면 종합소득세 합산과세(6.6%~49.5%) 또는 16.5% 분리과세 중 유리한 방식을 선택하여 납부할 수 있습니다.',
  },
  {
    question: '퇴직금을 IRP로 이체하여 수령하면 어떤 절세 혜택이 있나요?',
    answer:
      '퇴직금을 IRP 계좌로 수령 후 10년 이하 기간 동안 연금으로 수령하면 퇴직소득세의 30%가 감면(70%만 부과)되며, 10년 초과 수령 시 40% 감면(60%만 부과) 혜택이 적용됩니다.',
  },
];

export default function PensionTaxCalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '연금소득세 & 퇴직소득세 절세 계산기', path: '/tools/pension-tax-calculator' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '연금소득세 & 퇴직소득세 절세 계산기',
    description: '연령별 연금소득세율 및 1,500만원 한도 분리과세, 퇴직금 감면 계산 시뮬레이터',
    urlPath: '/tools/pension-tax-calculator',
    applicationCategory: 'FinanceApplication',
    features: [
      '만 55세~80세 이상 연령별 연금소득세율(3.3%~5.5%) 자동 적용',
      '사적연금 연 1,500만원 초과 시 16.5% 분리과세 vs 종합과세 비교',
      '퇴직소득세 30%~40% 절세 감면액 산출',
      '월별/연간 실수령 연금액 시뮬레이션',
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(appSchema) }}
      />
      {children}
    </>
  );
}
