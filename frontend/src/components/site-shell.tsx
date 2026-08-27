import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';

/**
 * The frame every page renders inside.
 *
 * Deliberately free of any cookie read. The rail needs to know who is
 * reading, but asking here would opt every page in the application out of
 * static generation — the rail lives in the root layout — and the public half
 * of this site is on Next precisely so a crawler receives finished HTML.
 * `SiteNav` therefore resolves the viewer after hydration instead.
 */
export function SiteShell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[14rem_1fr]">
      <SiteNav />
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 pb-6 pt-4 md:pt-6">
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
