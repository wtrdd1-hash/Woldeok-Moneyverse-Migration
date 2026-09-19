import { NoticeBar } from '@/components/notice-bar';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { ServiceImpactBanner } from '@/components/service-impact-banner';

/**
 * The frame every page renders inside: notice strip, masthead, page, footer,
 * and mobile bottom navigation on small screens.
 */
export function SiteShell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="moneyverse-app-shell flex min-h-dvh flex-col">
      <NoticeBar />
      <ServiceImpactBanner />
      <SiteHeader />
      <main id="main" className="moneyverse-main mx-auto w-full max-w-[1320px] flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-12 lg:pt-10">
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
