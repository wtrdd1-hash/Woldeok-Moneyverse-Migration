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
      <main id="main" className="mx-auto w-full max-w-[1180px] flex-1 px-6 pb-16 pt-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
