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
  title: 'ISA 계좌 절세 계산기 — 2026 일반형·서민형 비과세 한도 & 9.9% 분리과세 시뮬레이터 | 월덕 머니버스',
  description:
    'ISA(개인종합자산관리계좌) 일반형(200만원 비과세)과 서민형(400만원 비과세) 한도 초과분 9.9% 분리과세 혜택을 실시간 시뮬레이션하고 일반 계좌(15.4% 배당소득세) 대비 순 절세액을 즉시 계산하세요.',
  keywords: [
    'ISA 계산기',
    'ISA 계좌 절세',
    'ISA 일반형 서민형',
    'ISA 비과세 한도',
    'ISA 9.9% 분리과세',
    'ISA 배당소득세 절세',
    '개인종합자산관리계좌',
    'ISA 만기 절세',
  ],
  alternates: {
    canonical: canonicalUrl('/tools/isa-calculator'),
    languages: {
      'ko-KR': canonicalUrl('/tools/isa-calculator'),
      'en-US': canonicalUrl('/en/tools/isa-calculator'),
      'ja-JP': canonicalUrl('/ja/tools/isa-calculator'),
      'zh-CN': canonicalUrl('/zh/tools/isa-calculator'),
      'x-default': canonicalUrl('/tools/isa-calculator'),
    },
  },
  openGraph: {
    title: 'ISA 계좌 절세 계산기 — 2026 일반형·서민형 비과세 & 9.9% 분리과세 | 월덕 머니버스',
    description: '일반형 200만원, 서민형 400만원 비과세 및 초과 수익 9.9% 분리과세 실시간 절세 시뮬레이터',
    url: canonicalUrl('/tools/isa-calculator'),
    type: 'website',
    images: [
      {
        url: buildOgImageUrl({
          title: 'ISA 계좌 절세 계산기',
          description: '일반형·서민형 비과세 및 9.9% 분리과세 절세액 비교',
          badge: 'ISA Calculator',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: 'ISA 계좌 절세 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ISA 계좌 절세 계산기 — 2026 일반형·서민형 비과세 & 9.9% 분리과세 | 월덕 머니버스',
    description: '일반형 200만원, 서민형 400만원 비과세 및 초과 수익 9.9% 분리과세 실시간 절세 시뮬레이터',
  },
};

const FAQS = [
  {
    question: 'ISA 계좌의 비과세 혜택은 얼마까지 적용되나요?',
    answer:
      '일반형 ISA는 순이익 200만 원까지 전액 비과세되며, 총급여 5,000만 원(종합소득 3,800만 원) 이하 근로자가 가입하는 서민형 ISA는 순이익 400만 원까지 비과세됩니다. 비과세 한도 초과분에 대해서는 15.4%가 아닌 9.9% 분리과세 세율이 적용됩니다.',
  },
  {
    question: 'ISA 계좌의 손익상계 혜택은 어떻게 작동하나요?',
    answer:
      'ISA 계좌 내에서 발생한 이익과 손실을 통산(상계)하여 순이익에 대해서만 세금을 부과합니다. 예를 들어 A종목에서 500만 원 이익, B종목에서 200만 원 손실 시 순이익 300만 원에 대해서만 과세 체계가 적용됩니다.',
  },
  {
    question: 'ISA 만기 자금을 연금저축/IRP로 전환하면 추가 세액공제가 되나요?',
    answer:
      '네, ISA 만기 해지 금액을 60일 이내에 연금저축 또는 IRP로 전환 납입하면 전환 금액의 10%(최대 300만 원 한도)까지 추가 세액공제 혜택을 받을 수 있습니다.',
  },
];

export default function IsaCalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: 'ISA 계좌 절세 계산기', path: '/tools/isa-calculator' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: 'ISA 계좌 절세 계산기',
    description: '일반형·서민형 비과세 한도 및 9.9% 분리과세 절세액 계산 시뮬레이터',
    urlPath: '/tools/isa-calculator',
    applicationCategory: 'FinanceApplication',
    features: [
      '일반형(200만원) vs 서민형(400만원) 비과세 실시간 비교',
      '일반 계좌(15.4%) 대비 순 절세액 산출',
      '손익상계 기반 과세표준 자동 계산',
      '연금저축 추가 세액공제 연계 팁 제공',
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
