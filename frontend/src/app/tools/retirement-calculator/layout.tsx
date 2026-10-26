import type { Metadata } from 'next';
import { canonicalUrl, breadcrumbJsonLd, faqPageJsonLd, buildOgImageUrl } from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

const title = '퇴직금·퇴직소득세 예상 계산기 — 근속기간·급여·IRP 참고 | 월덕 머니버스';
const description = '근속 1년 이상 자격 기준과 월 급여·상여금으로 예상 퇴직금 및 퇴직소득세를 계산합니다. 주 15시간 등 실제 지급 요건과 세금은 별도로 확인하세요.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['퇴직금 계산기', '퇴직소득세', '퇴직금 실수령액', '근속기간', '퇴직연금 IRP', '퇴직급여 지급 요건'],
  alternates: {
    canonical: canonicalUrl('/tools/retirement-calculator'),
    languages: {
      'ko-KR': canonicalUrl('/tools/retirement-calculator'),
      'en-US': canonicalUrl('/en/tools/retirement-calculator'),
      'ja-JP': canonicalUrl('/ja/tools/retirement-calculator'),
      'zh-CN': canonicalUrl('/zh/tools/retirement-calculator'),
      'x-default': canonicalUrl('/tools/retirement-calculator'),
    },
  },
  openGraph: {
    title,
    description,
    url: canonicalUrl('/tools/retirement-calculator'),
    type: 'website',
    images: [{
      url: buildOgImageUrl({
        title: '퇴직금 예상 계산기',
        description: '근속기간 · 예상 퇴직금 · 퇴직소득세 참고 계산',
        badge: 'Severance Calculator',
        type: 'default',
      }),
      width: 1200, height: 630, alt: '퇴직금 예상 계산기',
    }],
  },
  twitter: { card: 'summary_large_image', title, description },
};

const faqs = [
  {
    question: '계속 근로기간이 1년 미만이면 법정 퇴직금이 발생하나요?',
    answer: '원칙적으로 1년 미만 계속 근로자는 법정 퇴직급여 대상이 아닙니다. 4주 평균 주 15시간 이상 등 요건도 별도로 충족해야 합니다.',
  },
  {
    question: '예상 퇴직금과 실제 지급액이 다른 이유는 무엇인가요?',
    answer: '실제 평균임금에는 상여금과 연차수당 등 법정 산입 항목이 반영되며 근무일수, 퇴직 시점, 세액과 근로시간에 따라 달라질 수 있습니다.',
  },
];

export default function RetirementCalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '퇴직금 예상 계산기', path: '/tools/retirement-calculator' },
  ]);
  const faqData = faqPageJsonLd(faqs);
  // The shared SEO helper fabricates aggregateRating by default; publish only verifiable fields.
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '퇴직금 예상 계산기',
    description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    url: canonicalUrl('/tools/retirement-calculator'),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(appSchema) }} />
      {children}
    </>
  );
}
