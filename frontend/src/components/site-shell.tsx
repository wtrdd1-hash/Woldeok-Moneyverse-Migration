import { NoticeBar } from '@/components/notice-bar';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { ServiceImpactBanner } from '@/components/service-impact-banner';
import { FintechTickerBar } from '@/components/fintech-ticker-bar';

export function SiteShell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="moneyverse-app-shell flex min-h-dvh flex-col w-full max-w-full overflow-x-hidden">
      <NoticeBar />
      <ServiceImpactBanner />
      <SiteHeader />
      <FintechTickerBar />
      <main
        id="main"
        className="moneyverse-main mx-auto w-full max-w-[1440px] flex-1 px-3 sm:px-6 pb-[calc(env(safe-area-inset-bottom)+5rem)] sm:pb-28 lg:pb-16 pt-6 sm:pt-9 lg:pt-10 xl:px-10 overflow-x-hidden"
      >
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
