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

const META_BY_LOCALE: Record<Locale, { title: string; description: string; canonical: string; badge: string }> = {
  ko: {
    title: '[무료/무로그인] 주식 물타기·평단가 계산기 — 1초 만에 추가매수 평단 & 탈출 목표가 즉시 산출 | 월덕 머니버스',
    description: '[로그인 없이 1초 산출] 추가 매수 시 변화하는 내 주식 평단가와 원금 회복 손익분기점, 목표 수익률 매도가를 실시간으로 즉시 계산하세요! 수수료·제세금 포함 실질 탈출 단가 및 물타기 시뮬레이션 제공.',
    canonical: '/tools/stock-calculator',
    badge: '무료/무로그인 1초 시뮬레이터',
  },
  en: {
    title: 'Stock Average Down & Break-even Calculator | Free DCA Simulator | Woldeok Moneyverse',
    description: 'Calculate your updated average price when dollar-cost averaging down. Find your break-even exit price and target sell price for desired ROI in seconds. Zero login required.',
    canonical: '/en/tools/stock-calculator',
    badge: 'Free DCA Simulator',
  },
  ja: {
    title: '株式ナンピン・平均取得単価＆利回り計算機 | 無料シミュレーター | ウォルドクマネーバース',
    description: '買い増し後の平均取得単価、元本回収損益分岐点、目標利益達成に必要な売却目標価格を瞬時に自動試算します。ログイン不要・完全無料。',
    canonical: '/ja/tools/stock-calculator',
    badge: '無料ナンピン試算ツール',
  },
  zh: {
    title: '股票补仓摊薄成本与保本价计算器 | 免费定投解套模拟 | 沃尔德克金融元宇宙',
    description: '实时精确计算加仓补仓后的动态平均成本、保本解套点以及达到目标收益率所需的卖出价格。无需登录，即开即用。',
    canonical: '/zh/tools/stock-calculator',
    badge: '免费股票补仓计算器',
  },
  vi: {
    title: 'Máy tính Bình quân Giá Cổ phiếu & Điểm Hòa Vốn (DCA) | Woldeok Moneyverse',
    description: 'Tính toán giá vốn trung bình sau khi mua thêm, xác định điểm hòa vốn và giá bán mục tiêu theo tỷ suất sinh lời mong muốn hoàn toàn miễn phí.',
    canonical: '/vi/tools/stock-calculator',
    badge: 'Mô phỏng DCA Miễn phí',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const meta = META_BY_LOCALE[locale] ?? META_BY_LOCALE.en;

  return {
    title: meta.title,
    description: meta.description,
    keywords: [
      '주식 물타기 계산기',
      '주식 평단가 계산기',
      'Stock DCA Calculator',
      'Stock Average Down Calculator',
      '株式ナンピン計算機',
      '股票补仓计算器',
      'Break-even Price Calculator',
    ],
    alternates: {
      canonical: canonicalUrl(meta.canonical),
      languages: {
        'ko-KR': canonicalUrl('/tools/stock-calculator'),
        'en-US': canonicalUrl('/en/tools/stock-calculator'),
        'ja-JP': canonicalUrl('/ja/tools/stock-calculator'),
        'zh-CN': canonicalUrl('/zh/tools/stock-calculator'),
        'vi-VN': canonicalUrl('/vi/tools/stock-calculator'),
        'x-default': canonicalUrl('/tools/stock-calculator'),
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
            images: [
        {
          url: buildOgImageUrl({
            title: localeLabel(
              locale,
              '주식 물타기·평단가 & 수익률 계산기',
              'Stock DCA & Break-even Calculator',
              '株式ナンピン・平均単価計算機',
              '股票补仓成本与保本价计算器',
              'Máy tính DCA Cổ phiếu'
            ),
            description: meta.description,
            badge: meta.badge,
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

export default async function StockCalculatorLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  const meta = META_BY_LOCALE[locale] ?? META_BY_LOCALE.en;

  const breadcrumbs = breadcrumbJsonLd([
    { name: localeLabel(locale, '홈', 'Home', 'ホーム', '首页', 'Trang chủ'), path: locale === 'ko' ? '/' : `/${locale}` },
    { name: localeLabel(locale, '금융 도구 허브', 'Tools Hub', 'ツール一覧', '工具中心', 'Trung tâm Công cụ'), path: locale === 'ko' ? '/tools' : `/${locale}/tools` },
    { name: localeLabel(locale, '주식 물타기·평단가 계산기', 'Stock DCA Calculator', '株式ナンピン計算機', '股票补仓计算器', 'Máy tính DCA Cổ phiếu'), path: meta.canonical },
  ]);

  const softwareLd = softwareApplicationJsonLd({
    urlPath: meta.canonical,
    name: localeLabel(locale, '주식 물타기·평단가 & 수익률 계산기', 'Stock DCA & Average Cost Calculator', '株式ナンピン計算機', '股票补仓计算器', 'Máy tính DCA Cổ phiếu'),
    applicationCategory: 'FinanceApplication',
    description: meta.description,
    features: [
      localeLabel(locale, '추가 매수 물타기 평단가 실시간 산출', 'Real-time Blended DCA Average Price', 'ナンピン平均単価のリアルタイム試算', '补仓动态持仓成本实时测算', 'Tính giá bình quân DCA tức thì'),
      localeLabel(locale, '손익분기점 탈출 매도가 및 수익률 역산', 'Break-even Exit Price & Target ROI Calculation', '損益分岐点脱出価格の逆算', '保本解套与目标卖出价反算', 'Tính giá bán hòa vốn và lợi nhuận'),
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
        dangerouslySetInnerHTML={{ __html: jsonLd(softwareLd) }}
      />
      {children}
    </>
  );
}
