import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Nanum_Myeongjo, Noto_Sans_KR } from 'next/font/google';
import { SiteShell } from '@/components/site-shell';
import { LocaleProvider } from '@/components/locale-provider';
import { CurrencyProvider } from '@/components/currency-context';
import { ThemeProvider } from '@/components/theme-provider';
import { ActivityTracker } from '@/components/activity-tracker';
import { Toaster } from '@/components/ui/sonner';
import { StaleTabNotice } from '@/components/stale-tab-notice';
import { RouteAwareFloatingUtilities } from '@/components/route-aware-floating-utilities';
import { ConsentGuard } from '@/components/consent-guard';
import { SessionKeepAlive } from '@/components/session-keep-alive';
import { WatchlistPromotionEngine } from '@/components/watchlist-promotion-engine';
import { FirstTradeOnboardingModal } from '@/components/first-trade-onboarding-modal';
import { StockAlertPushEngine } from '@/components/stock-alert-push-engine';
import { DeokiAiFloatingAssistant } from '@/components/deoki-ai-floating-assistant';
import { ViewportScrollGuardian } from '@/components/viewport-scroll-guardian';

import { currentViewer } from '@/lib/viewer';
import { fetchLatestPolicy } from '@/lib/api';
import { NOTICE_PREFERENCE_SCRIPT } from '@/lib/notice-preference';
import { POINT_PREFERENCE_SCRIPT } from '@/lib/theme';
import { jsonLd } from '@/lib/json-ld';
import { AdProviderBootstrap } from '@/components/ad-provider-bootstrap';
import { cookies } from 'next/headers';
import { getServerLocale } from '@/lib/locale-server';
import { localeLabel, type Locale } from '@/lib/locale';
import { CURRENCY_COOKIE, type Currency, isCurrency } from '@/lib/currency';
import { canonicalUrl as _canonicalUrl, webApplicationJsonLd } from '@/lib/seo';
// Keep the downloaded Bootstrap distribution quarantined in styles/vendor.
// Global Bootstrap utilities use !important (for example .bg-primary/.text-primary)
// and collide with this Tailwind theme, so the application shell must not import it.
import './globals.css';
import './cosmetics.css';
import './redesign.css';

/**
 * The product's own pairing, kept: a Korean serif for display and a Korean
 * sans for body. The original named Iropke Batang and Pretendard, neither of
 * which Google Fonts serves; Nanum Myeongjo and Noto Sans KR are the closest
 * available faces and were the original's own declared fallbacks.
 *
 * Self-hosted through next/font, so the files come from this origin: no
 * third-party request on any page load, no layout shift while a face
 * arrives, and no font host to admit in the content security policy.
 */
const myeongjo = Nanum_Myeongjo({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-myeongjo',
  display: 'swap',
  preload: false,
});

const notoKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-noto-kr',
  display: 'swap',
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

const indexingEnabled = process.env.SEO_INDEXING_ENABLED !== 'false';
const siteUrl = (process.env.APP_BASE_URL ?? 'https://easy-scraping.com').replace(/\/$/, '');

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f2' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
};

const META_BY_LOCALE = {
  en: {
    titleDefault: 'Woldeok Moneyverse — Virtual Economy, Stock Simulation & Finance Tools',
    titleTemplate: '%s · Woldeok Moneyverse',
    description:
      'Explore a fictional community economy, virtual-company stock simulation, and interactive finance calculators. WLD is game currency, not real money or an investment.',
    applicationName: 'Woldeok Moneyverse',
    category: 'Finance & Community Virtual Economy',
    keywords: [
      'Woldeok Moneyverse',
      'Virtual Stock Exchange',
      'Orderbook Trading',
      'Stop Loss Take Profit',
      'Compound Interest Calculator',
      'Virtual Economy',
      'Discord Bot',
      'WLD',
      'Sovereign Wealth Fund',
    ],
    ogLocale: 'en_US',
    ogTitle: 'Woldeok Moneyverse — Explore a Fictional Economy & Finance Tools',
  },
  ko: {
    titleDefault: '월덕 머니버스 — 가상경제·모의 주식·금융 계산기',
    titleTemplate: '%s · 월덕 머니버스',
    description:
      '가상 기업의 주식·경제 시뮬레이션과 복리·대출 등 금융 계산기를 체험하세요. WLD는 실제 돈이 아닌 게임 재화이며 금융 수익을 보장하지 않습니다.',
    applicationName: '월덕 머니버스',
    category: '가상 주식 거래소 & 핀테크 시뮬레이터',
    keywords: [
      '월덕 머니버스',
      '가상 주식',
      '가상 주식 거래소',
      '주식 모의투자',
      '호가창',
      '스탑로스',
      '복리 계산기',
      '대출이자 계산기',
      '배당소득세 계산기',
      '가상경제',
      'WLD',
      '디스코드 봇',
    ],
    ogLocale: 'ko_KR',
    ogTitle: '월덕 머니버스 — 가상경제 체험과 금융 계산기',
  },
  ja: {
    titleDefault: 'ウォルドク・マネーバース',
    titleTemplate: '%s · ウォルドク・マネーバース',
    description:
      'ウォルドク・マネーバースはDiscordコミュニティと連携した仮想経済・コミュニティゲームプラットフォームです。WLD報酬、仮想株式取引所、中央銀行、クエスト、シーズンイベントを体験できます。',
    applicationName: 'ウォルドク・マネーバース',
    category: 'コミュニティゲーム',
    keywords: [
      'ウォルドク・マネーバース',
      '仮想経済',
      'Discordゲーム',
      'Discord Bot',
      'WLD',
      'コミュニティゲーム',
      '仮想株式取引所',
      '中央銀行',
    ],
    ogLocale: 'ja_JP',
    ogTitle: 'ウォルドク・マネーバース — Discordコミュニティ仮想経済',
  },
  zh: {
    titleDefault: '月德 Moneyverse',
    titleTemplate: '%s · 月德 Moneyverse',
    description:
      '月德 Moneyverse 是与 Discord 社区联动的虚拟经济与社区游戏平台。在此体验活动记录、WLD游戏奖励、虚拟股票交易所、中央银行、任务与赛季活动。',
    applicationName: '月德 Moneyverse',
    category: '社区游戏',
    keywords: [
      '月德 Moneyverse',
      '虚拟经济',
      'Discord经济',
      'Discord机器人',
      'WLD',
      '社区游戏',
      '虚拟股票交易所',
      '中央银行',
    ],
    ogLocale: 'zh_CN',
    ogTitle: '月德 Moneyverse — Discord社区虚拟经济',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const meta = META_BY_LOCALE[locale];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: meta.titleDefault,
      template: meta.titleTemplate,
    },
    description: meta.description,
    applicationName: meta.applicationName,
    category: meta.category,
    keywords: meta.keywords,
    alternates: {
      canonical: '/',
      languages: {
        'ko-KR': '/',
        'en-US': '/en',
        'ja-JP': '/ja',
        'zh-CN': '/zh',
        'x-default': '/',
      },
    },
    verification: {
      google:
        process.env.SEARCH_CONSOLE_VERIFICATION ||
        process.env.GOOGLE_SITE_VERIFICATION ||
        'LA_iZKHzpEm283d7h5CK-ttGDxf8MnBdXoMc5WFozuY',
      other: {
        'naver-site-verification':
          process.env.NAVER_SITE_VERIFICATION || 'f77f52636d9465715f5d6f1dfc2ad65b68df9f2e',
      },
    },
    robots: {
      index: indexingEnabled,
      follow: indexingEnabled,
      googleBot: {
        index: indexingEnabled,
        follow: indexingEnabled,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      siteName: meta.titleDefault,
      locale: meta.ogLocale,
      alternateLocale: ['ko_KR', 'en_US', 'ja_JP', 'zh_CN'].filter((l) => l !== meta.ogLocale),
      title: meta.ogTitle,
      description: meta.description,
      url: siteUrl,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: meta.ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.ogTitle,
      description: meta.description,
      images: ['/opengraph-image'],
    },
  };
}

function getSiteStructuredData(locale: Locale) {
  const meta = META_BY_LOCALE[locale];
  const langTag = locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : locale === 'zh' ? 'zh-CN' : 'en-US';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: meta.titleDefault,
        inLanguage: langTag,
        description: meta.description,
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: meta.titleDefault,
        url: siteUrl,
      },
      webApplicationJsonLd(),
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: localeLabel(locale, '월덕 머니버스의 WLD는 실제 돈인가요?', 'Is WLD currency real money?', 'WLDは実際の通貨ですか？', 'WLD是真实货币吗？'),
            acceptedAnswer: {
              '@type': 'Answer',
              text: localeLabel(locale, 'WLD는 서비스 내에서 사용하는 가상 게임 재화이며 현실 화폐, 예금 또는 금융상품이 아닙니다. 보상이 실제로 지급된 경우에만 계정별 확인된 기록으로 안내합니다.', 'WLD is a simulated in-game virtual currency, not fiat money, bank deposits, or real financial securities.', 'WLDはゲーム内シミュレーション通貨であり、現実の法定通貨、預金、または金融商品ではありません。', 'WLD是仅用于游戏内模拟的虚拟游戏道具，绝非真实现金、银行存款或金融投资产品。'),
            },
          },
          {
            '@type': 'Question',
            name: localeLabel(locale, '가상 주식 거래소는 실시간으로 운영되나요?', 'Does the virtual stock exchange run in real-time?', '仮想株式取引所はリアルタイムで運営されていますか？', '虚拟股票交易所是实时运行的吗？'),
            acceptedAnswer: {
              '@type': 'Answer',
              text: localeLabel(locale, '네, 18개 상장사의 실시간 10단 호가창, TradingView급 인터랙티브 캔들 차트, MACD/RSI/볼린저 보조지표, 스탑로스 및 익절 자동 감시 주문을 수수료 없이 무료로 제공합니다.', 'Yes, it provides 10-depth orderbooks for 18 companies, interactive candlestick charts, technical indicators, and automated stop-loss/take-profit orders.', 'はい、18大上場企業の10段階気配値板、インタラクティブなローソク足チャート、自動ストップロス注文をリアルタイムでシミュレートしています。', '是的，提供18家虚拟上标的实时10档深度盘口、K线交互图表与全自动止盈止损盯盘策略。'),
            },
          },
          {
            '@type': 'Question',
            name: localeLabel(locale, '어떤 금융 계산기 도구를 무료로 이용할 수 있나요?', 'Which finance calculators can I use for free?', 'どの金融計算機を無料で利用できますか？', '可以免费使用哪些金融计算器？'),
            acceptedAnswer: {
              '@type': 'Answer',
              text: localeLabel(locale, '복리 예금·적금(CAGR/DCA), 대출이자 상환, 배당소득세, 청년도약계좌, ISA 비과세, 부동산 취득세 등 12종 실전 계산기를 즉시 무료로 이용할 수 있습니다.', 'You can freely use 12 financial calculators including compound interest, loan amortization, dividend tax, retirement planning, and crypto yields.', '複利預金・積立、ローン返済利息、配当所得税、退職資産シミュレーターなど12種類の計算ツールを無料ですぐにご利用いただけます。', '可免费即刻使用复利储蓄、贷款分期偿还、股息所得税、退休养老规划等12款实用金融测算工具。'),
            },
          },
        ],
      },
    ],
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = await getServerLocale();
  const rawCurrency = cookieStore.get(CURRENCY_COOKIE)?.value;
  const initialCurrency: Currency | undefined = isCurrency(rawCurrency) ? rawCurrency : undefined;
  const [viewer, policy] = await Promise.all([currentViewer(), fetchLatestPolicy()]);
  const siteStructuredData = getSiteStructuredData(locale);

  return (
    <html
      lang={locale}
      data-locale={locale}
      // The theme scripts below write to this element before hydration, which
      // is the whole point of them; React is told not to report the
      // difference it will find.
      suppressHydrationWarning
      className={`${myeongjo.variable} ${notoKr.variable} ${plexMono.variable}`}
    >
      <body className="bg-[#090A0F] text-[#F9FAFB] min-h-screen antialiased selection:bg-[#00F59B]/20 selection:text-[#00F59B]">
        <AdProviderBootstrap />
        <ConsentGuard
          signedIn={viewer.signedIn}
          consentCurrent={viewer.consentCurrent}
          termsVersion={policy.termsVersion}
          privacyVersion={policy.privacyVersion}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(siteStructuredData) }}
        />
        {/* Applies the reader's dismissal of the notice strip before the strip
            is painted. An effect would run after it is already on screen, and
            taking it away again is worse than never showing it. */}
        <script dangerouslySetInnerHTML={{ __html: NOTICE_PREFERENCE_SCRIPT }} />
        {/* And the reader's point colour, for the same reason: a colour
            applied after paint is a colour the reader watches change. */}
        <script dangerouslySetInnerHTML={{ __html: POINT_PREFERENCE_SCRIPT }} />
        {/* Auto-recover from chunk load failures caused by rolling deployments */}
        <script
          dangerouslySetInnerHTML={{
            __html: "window.addEventListener('error',function(e){if(e.target&&(e.target.tagName==='SCRIPT'||e.target.tagName==='LINK')&&(e.target.src||e.target.href)&&(e.target.src||e.target.href).indexOf('/_next/static/')!==-1){var k='wdmv_chunk_err_'+Math.floor(Date.now()/15000);if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,'1');setTimeout(function(){window.location.reload();},250);}}},true);",
          }}
        />
        {/* Instant horizontal scroll zero-lock to prevent mobile/desktop left-side clipping */}
        <script
          dangerouslySetInnerHTML={{
            __html: "window.addEventListener('scroll',function(){if(window.scrollX!==0||document.documentElement.scrollLeft!==0||document.body.scrollLeft!==0){window.scrollTo(0,window.scrollY);document.documentElement.scrollLeft=0;document.body.scrollLeft=0;}},{passive:true});",
          }}
        />
        {/* A keyboard user should not have to walk the whole rail to reach the
            page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-0 focus:z-[100] focus:rounded-b-lg focus:bg-forest focus:px-4 focus:py-3 focus:text-white"
        >
          {localeLabel(locale, '본문으로 건너뛰기', 'Skip to main content', '本文へスキップ', '跳至正文')}
        </a>
        <LocaleProvider initialLocale={locale}>
          <CurrencyProvider initialCurrency={initialCurrency}>
            <Suspense fallback={null}>
              <ActivityTracker />
            </Suspense>
            <ThemeProvider>
              <ViewportScrollGuardian />
              <SiteShell>{children}</SiteShell>
              <Toaster />
              <StaleTabNotice />
              <RouteAwareFloatingUtilities />
              <SessionKeepAlive />
              <WatchlistPromotionEngine />
              <FirstTradeOnboardingModal />
              <StockAlertPushEngine />
            </ThemeProvider>

          </CurrencyProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
