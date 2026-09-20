import { NoticeBar } from '@/components/notice-bar';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { ServiceImpactBanner } from '@/components/service-impact-banner';

export function SiteShell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="moneyverse-app-shell flex min-h-dvh flex-col w-full max-w-full overflow-x-hidden">
      <NoticeBar />
      <ServiceImpactBanner />
      <SiteHeader />
      <main
        id="main"
        className="moneyverse-main mx-auto w-full max-w-[1440px] min-w-0 flex-1 px-3 pb-28 pt-5 sm:px-6 sm:pt-9 lg:px-10 lg:pb-16 lg:pt-12 xl:px-12 overflow-x-hidden"
      >
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
