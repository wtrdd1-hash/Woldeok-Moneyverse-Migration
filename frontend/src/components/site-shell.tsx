import { NoticeBar } from '@/components/notice-bar';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

/**
 * The frame every page renders inside: notice strip, masthead, page, footer —
 * the original's arrangement.
 *
 * Deliberately free of any cookie read. The masthead needs to know who is
 * reading, but asking here would opt every page in the application out of
 * static generation, and the public half of this site is on Next precisely so
 * a crawler receives finished HTML.
 */
export function SiteShell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <NoticeBar />
      <SiteHeader />
      {/* A uniform 24px frame. 40px above and 64px below was a fifth of a phone
          screen spent on nothing, and the footer's own 80px top margin already
          keeps the last card clear of the band beneath it — 64px on top of that
          was 144px of empty paper. The width stays at 1180px because the
          masthead and the footer are 1180px, and the horizontal padding stays
          at 24px because the masthead's is: pulling only the page in would take
          every page title out of line with the wordmark above it. */}
      <main id="main" className="mx-auto w-full max-w-[1180px] flex-1 p-6">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
