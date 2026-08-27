import type { Metadata } from 'next';
import { Hahmlet, IBM_Plex_Mono, IBM_Plex_Sans_KR } from 'next/font/google';
import { SiteNav } from '@/components/site-nav';
import './globals.css';

/**
 * Self-hosted through next/font: the files are served from this origin, so
 * there is no third-party request on any page load and no layout shift while a
 * face arrives. It also keeps the CSP free of a font host.
 *
 * Hahmlet is a Korean-and-Latin serif with strong vertical stress — chosen
 * over the editorial serif that generated pages default to, and over Inter or
 * Geist, neither of which was drawn with Hangul as a first-class concern.
 */
const hahmlet = Hahmlet({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-hahmlet',
  display: 'swap',
});

const plexKr = IBM_Plex_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-kr',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: '월덕 머니버스',
    template: '%s · 월덕 머니버스',
  },
  description: '월덕 커뮤니티의 가상 경제. 지갑, 상점, 주식, 사업, 시즌 이벤트.',
  applicationName: '월덕 머니버스',
  openGraph: {
    type: 'website',
    siteName: '월덕 머니버스',
    locale: 'ko_KR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${hahmlet.variable} ${plexKr.variable} ${plexMono.variable}`}>
      <body>
        {/* A keyboard user should not have to walk the whole rail to reach the
            page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--card)] focus:px-4 focus:py-2"
        >
          본문으로 건너뛰기
        </a>
        <div className="min-h-dvh md:grid md:grid-cols-[13rem_1fr]">
          <SiteNav />
          <main id="main" className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 md:pb-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
