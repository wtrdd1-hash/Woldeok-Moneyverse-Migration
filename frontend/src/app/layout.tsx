import type { Metadata } from 'next';
import { IBM_Plex_Mono, Nanum_Myeongjo, Noto_Sans_KR } from 'next/font/google';
import { SiteShell } from '@/components/site-shell';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { NOTICE_PREFERENCE_SCRIPT } from '@/lib/notice-preference';
import { POINT_PREFERENCE_SCRIPT } from '@/lib/theme';
import './globals.css';

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
    <html
      lang="ko"
      // The theme scripts below write to this element before hydration, which
      // is the whole point of them; React is told not to report the
      // difference it will find.
      suppressHydrationWarning
      className={`${myeongjo.variable} ${notoKr.variable} ${plexMono.variable}`}
    >
      <body>
        {/* Applies the reader's dismissal of the notice strip before the strip
            is painted. An effect would run after it is already on screen, and
            taking it away again is worse than never showing it. */}
        <script dangerouslySetInnerHTML={{ __html: NOTICE_PREFERENCE_SCRIPT }} />
        {/* And the reader's point colour, for the same reason: a colour
            applied after paint is a colour the reader watches change. */}
        <script dangerouslySetInnerHTML={{ __html: POINT_PREFERENCE_SCRIPT }} />
        {/* A keyboard user should not have to walk the whole rail to reach the
            page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-0 focus:z-[100] focus:rounded-b-lg focus:bg-forest focus:px-4 focus:py-3 focus:text-white"
        >
          본문으로 건너뛰기
        </a>
        <ThemeProvider>
          <SiteShell>{children}</SiteShell>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
