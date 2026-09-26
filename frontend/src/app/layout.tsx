import { Suspense } from 'react';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Nanum_Myeongjo, Noto_Sans_KR } from 'next/font/google';
import { SiteShell } from '@/components/site-shell';
import { LocaleProvider } from '@/components/locale-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ActivityTracker } from '@/components/activity-tracker';
import { Toaster } from '@/components/ui/sonner';
import { StaleTabNotice } from '@/components/stale-tab-notice';
import { ConsentGuard } from '@/components/consent-guard';
import { currentViewer } from '@/lib/viewer';
import { fetchLatestPolicy } from '@/lib/api';
import { NOTICE_PREFERENCE_SCRIPT } from '@/lib/notice-preference';
import { POINT_PREFERENCE_SCRIPT } from '@/lib/theme';
import { jsonLd } from '@/lib/json-ld';
import { cookies } from 'next/headers';
import {
  DEFAULT_LOCALE,
  DETECTED_LOCALE_COOKIE,
  LOCALE_COOKIE,
  type Locale,
  isLocale,
} from '@/lib/locale';
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
});

const notoKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-noto-kr',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

const indexingEnabled = process.env.SEO_INDEXING_ENABLED !== 'false';
const siteUrl = (process.env.APP_BASE_URL ?? 'https://easy-scraping.com').replace(/\/$/, '');

const META_BY_LOCALE = {
  en: {
    titleDefault: 'Woldeok Moneyverse',
    titleTemplate: '%s · Woldeok Moneyverse',
    description:
      'Woldeok Moneyverse is a virtual economy and community gaming platform linked to Discord. Explore activity logs, WLD rewards, virtual stock exchange, central bank, quests, and seasonal events.',
    applicationName: 'Woldeok Moneyverse',
    category: 'Community Gaming & Virtual Economy',
    keywords: [
      'Woldeok Moneyverse',
      'Virtual Economy',
      'Discord Bot',
      'Community Game',
      'WLD',
      'Virtual Stock Exchange',
      'Virtual Central Bank',
      'Seasonal Events',
    ],
    ogLocale: 'en_US',
    ogTitle: 'Woldeok Moneyverse — Discord Virtual Economy & Game',
  },
  ko: {
    titleDefault: '월덕 머니버스',
    titleTemplate: '%s · 월덕 머니버스',
    description:
      '월덕 머니버스는 Discord 커뮤니티와 연결된 가상경제·커뮤니티 게임 서비스입니다. 활동 기록과 WLD 게임 보상, 가상 주식 거래소, 중앙은행, 퀘스트, 시즌 이벤트를 한곳에서 경험하세요.',
    applicationName: '월덕 머니버스',
    category: '커뮤니티 게임',
    keywords: [
      '월덕 머니버스',
      '가상경제',
      '디스코드 봇',
      '커뮤니티 게임',
      'WLD',
      '덕',
      'Discord Economy',
      'Woldeok Moneyverse',
      '게임 경제',
      '가상 주식',
    ],
    ogLocale: 'ko_KR',
    ogTitle: '월덕 머니버스 — Discord 커뮤니티 가상경제',
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
  const cookieStore = await cookies();
  const rawLocale =
    cookieStore.get(LOCALE_COOKIE)?.value ||
    cookieStore.get(DETECTED_LOCALE_COOKIE)?.value;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
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
      canonical: siteUrl,
    },
    verification: {
      google: process.env.SEARCH_CONSOLE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION || undefined,
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
    ],
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const explicit = cookieStore.get(LOCALE_COOKIE)?.value;
  const detected = cookieStore.get(DETECTED_LOCALE_COOKIE)?.value;
  const locale = isLocale(explicit) ? explicit : isLocale(detected) ? detected : DEFAULT_LOCALE;
  const [viewer, policy] = await Promise.all([currentViewer(), fetchLatestPolicy()]);
  const siteStructuredData = getSiteStructuredData(locale);

  return (
    <html
      lang={locale}
      // The theme scripts below write to this element before hydration, which
      // is the whole point of them; React is told not to report the
      // difference it will find.
      suppressHydrationWarning
      className={`${myeongjo.variable} ${notoKr.variable} ${plexMono.variable}`}
    >
      <body>
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
        {/* A keyboard user should not have to walk the whole rail to reach the
            page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-0 focus:z-[100] focus:rounded-b-lg focus:bg-forest focus:px-4 focus:py-3 focus:text-white"
        >
          본문으로 건너뛰기
        </a>
        <LocaleProvider>
          <Suspense fallback={null}>
            <ActivityTracker />
          </Suspense>
          <ThemeProvider>
            <SiteShell>{children}</SiteShell>
            <Toaster />
            <StaleTabNotice />
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
