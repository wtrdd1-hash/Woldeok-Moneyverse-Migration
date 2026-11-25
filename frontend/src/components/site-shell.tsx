'use client';

import { GameSidebar } from '@/components/game-sidebar';
import { GameTopbar } from '@/components/game-topbar';
import { ClientErrorReporter } from '@/components/client-error-reporter';

export function SiteShell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-[#070810] text-[#e2e8f0] font-sans antialiased">
      <ClientErrorReporter />
      {/* 1. Left Fixed Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <GameSidebar />
      </div>

      {/* 2. Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <GameTopbar />
        <main id="main" className="flex-1 p-6 lg:p-8 max-w-[1440px] w-full mx-auto pb-[calc(env(safe-area-inset-bottom)+5rem)]">
          {children}
        </main>
        {/* Footer Concept Bar */}
        <footer className="border-t border-[#1f1d38]/60 px-8 py-4 text-xs font-mono text-[#555577] flex items-center justify-between">
          <span>DESIGN CONCEPT · v2026.11.23.10 · ORIGINAL FAVICON PIXELS</span>
          <div className="flex gap-4 text-[#777799]">
            <a href="/terms" className="hover:text-white transition-colors">이용약관</a>
            <a href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</a>
            <a href="/support" className="hover:text-white transition-colors">고객지원</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
