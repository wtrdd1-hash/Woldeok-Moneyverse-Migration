import type { Metadata } from 'next';
import { canonicalUrl, breadcrumbJsonLd, buildOgImageUrl } from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';
import { ToolsGuestConversionBar } from '@/components/tools-guest-conversion-bar';

export const metadata: Metadata = {
  title: '금융 & 시뮬레이터 웹 도구 허브 | 월덕 머니버스',
  description:
    '설치 없이 브라우저에서 바로 사용하는 3대 금융 계산기: 복리 예금·적금 이자 계산기, 주식 물타기·평단가 및 수익률 계산기, 직업별 일일 파밍 루틴 시뮬레이터를 무료로 이용하세요.',
  keywords: [
    '금융 계산기',
    '복리 계산기',
    '적금 이자 계산기',
    '주식 물타기 계산기',
    '평단가 계산기',
    '주식 수익률 계산기',
    '가상경제 시뮬레이터',
    '앱테크 파밍 계산기',
  ],
  alternates: {
    canonical: '/tools',
  },
  openGraph: {
    title: '금융 & 시뮬레이터 웹 도구 허브 | 월덕 머니버스',
    description: '설치 없이 브라우저에서 바로 사용하는 3대 금융 계산기 및 가상경제 시뮬레이터 툴킷',
    url: canonicalUrl('/tools'),
    images: [
      {
        url: buildOgImageUrl({
          title: '금융 & 시뮬레이터 웹 도구 허브',
          description: '복리 예적금 계산기 · 주식 물타기 평단가 · 직업 파밍 시뮬레이터',
          badge: 'Financial Toolkit',
          type: 'default',
        }),
        width: 1200,
        height: 630,
        alt: '금융 & 시뮬레이터 웹 도구 허브',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '금융 & 시뮬레이터 웹 도구 허브 | 월덕 머니버스',
    description: '설치 없이 브라우저에서 바로 사용하는 3대 금융 계산기 및 가상경제 시뮬레이터 툴킷',
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />
      {children}
      <ToolsGuestConversionBar />
    </>
  );
}
