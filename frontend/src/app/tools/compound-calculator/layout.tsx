import type { Metadata } from 'next';
import {
  canonicalUrl,
  breadcrumbJsonLd,
  faqPageJsonLd,
  softwareApplicationJsonLd,
  buildOgImageUrl,
} from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';
import { getServerLocale } from '@/lib/locale-server';
import { type Locale, localeLabel } from '@/lib/locale';

const META_BY_LOCALE: Record<Locale, { title: string; description: string; canonical: string }> = {
  ko: {
    title: '[무료/무로그인] 복리·CAGR 계산기 — 1초 만에 적립식 만기수령액·DCA 초과수익 시뮬레이션 | 월덕 머니버스',
    description: '[로그인 없이 즉시 계산] 초기 원금, 매월 적립액, 연 이자율만 입력하면 1초 만에 일/월/연 복리 만기 수령액과 단리 대비 복리 초과 수익을 차트로 확인하세요! 연평균 복리수익률(CAGR) 및 적립식 DCA 분할투자 효과 실시간 정밀 시뮬레이터.',
    canonical: '/tools/compound-calculator',
  },
  en: {
    title: 'Compound Interest & CAGR Investment Calculator | S&P 500 & DCA Simulator | Woldeok Moneyverse',
    description: 'Calculate future investment growth with monthly contributions, compound interest, and CAGR yield in 1 second. Zero login required.',
    canonical: '/en/tools/compound-interest-calculator',
  },
  ja: {
    title: '複利・CAGR投資計算機 | 積立投資＆S&P500シミュレーター | ウォルドクマネーバース',
    description: '初期元金と毎月積立額、年平均利回り（CAGR）から将来資産推移と複利効果を瞬時に自動試算します。完全無料・ログイン不要。',
    canonical: '/ja/tools/compound-interest-calculator',
  },
  zh: {
    title: '复利与CAGR年化复合收益率计算器 | 定投解套与财富滚雪球模拟器 | 沃尔德克金融元宇宙',
    description: '输入初始本金、每月定投额和年化收益率，1秒直观测算按日、按月、按年复利到期总金额。无需登录，即开即用。',
    canonical: '/zh/tools/compound-interest-calculator',
  },
  vi: {
    title: 'Máy tính Lãi kép & CAGR Tích lũy Đầu tư | Woldeok Moneyverse',
    description: 'Tính toán giá trị tài sản trong tương lai với số tiền gửi định kỳ hàng tháng và lãi kép trực quan hoàn toàn miễn phí.',
    canonical: '/vi/tools/compound-interest-calculator',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const meta = META_BY_LOCALE[locale] ?? META_BY_LOCALE.en;

  return {
    title: meta.title,
    description: meta.description,
    keywords: [
      'cagr',
      'cagr 계산기',
      '복리 계산기',
      'Compound Interest Calculator',
      'CAGR Calculator',
      '複利計算機',
      '复利计算器',
    ],
    alternates: {
      canonical: canonicalUrl(meta.canonical),
      languages: {
        'ko-KR': canonicalUrl('/tools/compound-calculator'),
        'en-US': canonicalUrl('/en/tools/compound-interest-calculator'),
        'ja-JP': canonicalUrl('/ja/tools/compound-interest-calculator'),
        'zh-CN': canonicalUrl('/zh/tools/compound-interest-calculator'),
        'vi-VN': canonicalUrl('/vi/tools/compound-interest-calculator'),
        'x-default': canonicalUrl('/tools/compound-calculator'),
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl(meta.canonical),
      images: [
        {
          url: buildOgImageUrl({
            title: localeLabel(locale, '복리·CAGR 계산기', 'Compound Interest & CAGR Calculator', '複利・CAGR計算機', '复利与CAGR计算器', 'Máy tính Lãi kép CAGR'),
            description: meta.description,
            badge: localeLabel(locale, '무료 시뮬레이터', 'Free Simulator', '無料試算ツール', '免费模拟器', 'Mô phỏng Miễn phí'),
            type: 'default',
          }),
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function CompoundCalculatorLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  const meta = META_BY_LOCALE[locale] ?? META_BY_LOCALE.en;

  const breadcrumbs = breadcrumbJsonLd([
    { name: localeLabel(locale, '홈', 'Home', 'ホーム', '首页', 'Trang chủ'), path: locale === 'ko' ? '/' : `/${locale}` },
    { name: localeLabel(locale, '금융 도구 허브', 'Tools Hub', 'ツール一覧', '工具中心', 'Trung tâm Công cụ'), path: locale === 'ko' ? '/tools' : `/${locale}/tools` },
    { name: localeLabel(locale, '복리·CAGR 계산기', 'Compound Calculator', '複利計算機', '复利计算器', 'Máy tính Lãi kép'), path: meta.canonical },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />
      {children}
    </>
  );
}
