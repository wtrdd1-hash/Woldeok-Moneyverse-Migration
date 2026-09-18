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
      <main id="main" className="moneyverse-main mx-auto w-full max-w-[1240px] flex-1 p-4 sm:p-6 lg:px-8 pb-24 lg:pb-8">
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
