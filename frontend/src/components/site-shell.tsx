import { NoticeBar } from '@/components/notice-bar';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

/**
 * The frame every page renders inside: notice strip, masthead, page, footer,
 * and mobile bottom navigation on small screens.
 */
export function SiteShell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <NoticeBar />
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[1180px] flex-1 p-4 sm:p-6 pb-24 lg:pb-6">
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
