import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export function SiteShell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="moneyverse-app-shell flex min-h-dvh flex-col w-full max-w-full overflow-x-hidden bg-[#090A0F]">
      {/* 2026 Toss-style Clean Single Header */}
      <SiteHeader />
      <main
        id="main"
        className="moneyverse-main mx-auto w-full max-w-[1440px] flex-1 px-3 sm:px-6 pb-[calc(env(safe-area-inset-bottom)+5rem)] sm:pb-28 lg:pb-16 pt-3 sm:pt-6 overflow-x-hidden"
      >
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
