import { Suspense } from 'react';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Nanum_Myeongjo, Noto_Sans_KR } from 'next/font/google';
import { SiteShell } from '@/components/site-shell';
import { LocaleProvider } from '@/components/locale-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ActivityTracker } from '@/components/activity-tracker';
import { Toaster } from '@/components/ui/sonner';
import { NOTICE_PREFERENCE_SCRIPT } from '@/lib/notice-preference';
import { POINT_PREFERENCE_SCRIPT } from '@/lib/theme';
import { jsonLd } from '@/lib/json-ld';
import { cookies } from 'next/headers';
import {
  DEFAULT_LOCALE,
  DETECTED_LOCALE_COOKIE,
  LOCALE_COOKIE,
  isLocale,
} from '@/lib/locale';
import './globals.css';
import './cosmetics.css';

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

const indexingEnabled = process.env.SEO_INDEXING_ENABLED === 'true';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL ?? 'https://easy-scraping.com'),
  title: {
    default: '월덕 머니버스',
    template: '%s · 월덕 머니버스',
  },
  description:
    'Discord로 이어지는 월덕 커뮤니티의 가상경제 서비스. 활동 기록, WLD 보상, 게임 상점과 시즌 이벤트를 한곳에서 확인하세요.',
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
    '출석 보상',
  ],
  verification: {
    google: process.env.SEARCH_CONSOLE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  robots: {
    index: indexingEnabled,
    follow: indexingEnabled,
  },
  openGraph: {
    type: 'website',
    siteName: '월덕 머니버스',
    locale: 'ko_KR',
    title: '월덕 머니버스 — Discord 커뮤니티 가상경제',
    description:
      'Discord 커뮤니티 활동을 기록하고 WLD 보상과 게임 상점을 함께 이용하는 월덕 머니버스입니다.',
    url: '/',
  },
  twitter: {
    card: 'summary',
    title: '월덕 머니버스 — Discord 커뮤니티 가상경제',
    description:
      'Discord 커뮤니티 활동을 기록하고 WLD 보상과 게임 상점을 함께 이용하는 월덕 머니버스입니다.',
  },
};

const siteUrl = (process.env.APP_BASE_URL ?? 'https://easy-scraping.com').replace(/\/$/, '');
const siteStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: '월덕 머니버스',
      inLanguage: 'ko-KR',
      description: 'Discord로 이어지는 월덕 커뮤니티의 가상 경제 서비스',
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: '월덕 머니버스',
      url: siteUrl,
      email: 'jungchwimisaenghwal63@gmail.com',
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const explicit = cookieStore.get(LOCALE_COOKIE)?.value;
  const detected = cookieStore.get(DETECTED_LOCALE_COOKIE)?.value;
  const locale = isLocale(explicit) ? explicit : isLocale(detected) ? detected : DEFAULT_LOCALE;

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
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
