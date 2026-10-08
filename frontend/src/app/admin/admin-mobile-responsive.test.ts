import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const aiStatus = readFileSync('src/app/admin/economy/ai-status-card.tsx', 'utf8');
const traffic = readFileSync('src/app/admin/logs/activity/traffic-dashboard.tsx', 'utf8');
const activity = readFileSync('src/app/admin/logs/activity/page.tsx', 'utf8');

const subNav = readFileSync('src/components/admin-sub-nav.tsx', 'utf8');
const userDirectory = readFileSync('src/app/admin/users/user-directory.tsx', 'utf8');
const market = readFileSync('src/app/admin/market/page.tsx', 'utf8');
const support = readFileSync('src/app/admin/support/admin-support-view.tsx', 'utf8');
const workForms = readFileSync('src/app/admin/work/admin-work-forms.tsx', 'utf8');
const shopView = readFileSync('src/app/admin/shop/admin-shop-view.tsx', 'utf8');
const treasuryView = readFileSync('src/app/admin/treasury/treasury-view.tsx', 'utf8');
const bankPage = readFileSync('src/app/admin/bank/page.tsx', 'utf8');
const seoView = readFileSync('src/app/admin/seo/seo-client-view.tsx', 'utf8');
const analyticsView = readFileSync('src/app/admin/analytics/analytics-client-view.tsx', 'utf8');
const floatingUtilities = readFileSync('src/components/route-aware-floating-utilities.tsx', 'utf8');
const siteShell = readFileSync('src/components/site-shell.tsx', 'utf8');
const rootLayout = readFileSync('src/app/layout.tsx', 'utf8');
const indexingApiCard = readFileSync('src/app/admin/seo/indexing-api-card.tsx', 'utf8');

describe('administrator mobile responsive guards', () => {
  it('uses stacked AI agent cards below the small breakpoint and keeps the desktop table', () => {
    expect(aiStatus).toContain('className="grid gap-2 sm:hidden"');
    expect(aiStatus).toContain('className="hidden overflow-x-auto sm:block"');
  });

  it('uses stacked traffic rows below the small breakpoint', () => {
    expect(traffic).toContain('className="grid gap-2 sm:hidden"');
    expect(traffic).toContain('className="hidden overflow-x-auto sm:block"');
  });

  it('uses mobile activity cards and full-width filters instead of forcing a wide table', () => {
    expect(activity).toContain('className="grid gap-3 md:hidden"');
    expect(activity).toContain('className="hidden overflow-x-auto md:block"');
    expect(activity).toContain('className="w-full sm:w-48"');
    expect(activity).toContain('className="w-full sm:w-28"');
  });

  it('keeps admin sub nav inside the mobile viewport and scrolls the active tab into view', () => {
    expect(subNav).toContain('max-w-full min-w-0 mb-4 overflow-x-auto');
    expect(subNav).not.toContain('-mx-3');
    expect(subNav).toContain('scrollbar-none touch-pan-x overscroll-x-contain');
    expect(subNav).toContain('scrollIntoView');
  });

  it('preserves horizontal scrolling with minimum widths for market and work console tables and adds mobile stock cards', () => {
    expect(market).toContain('min-w-[580px]');
    expect(market).toContain('min-w-[720px]');
    expect(market).toContain('className="grid gap-3 p-4 md:hidden divide-y divide-border/40"');
    expect(workForms).toContain('min-w-[720px]');
  });

  it('provides smooth horizontal scrollbars for user directory sort tabs and support chat tabs', () => {
    expect(userDirectory).toContain('flex-nowrap overflow-x-auto no-scrollbar');
    expect(support).toContain('flex flex-nowrap overflow-x-auto no-scrollbar');
    expect(support).toContain('max-h-72 lg:max-h-none overflow-y-auto');
  });

  it('provides mobile card stack views for shop, treasury, and bank consoles', () => {
    expect(shopView).toContain('className="grid gap-3 md:hidden"');
    expect(shopView).toContain('className="hidden md:block');
    expect(treasuryView).toContain('className="grid gap-3 p-4 md:hidden divide-y divide-border/40"');
    expect(treasuryView).toContain('className="hidden md:block overflow-x-auto"');
    expect(bankPage).toContain('className="grid gap-3 p-4 md:hidden divide-y divide-border/40"');
    expect(bankPage).toContain('className="hidden md:block overflow-x-auto"');
  });

  it('stacks long SEO actions on narrow screens instead of shrinking labels into each other', () => {
    expect(seoView).toContain('grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto');
    expect(seoView).toContain('whitespace-normal text-center leading-tight');
  });

  it('keeps analytics category tabs intrinsic-width inside a local horizontal scroller', () => {
    expect(analyticsView).toContain('overflow-x-auto');
    expect(analyticsView).toContain('flex-none');
    expect(analyticsView).toContain('w-max min-w-full');
  });

  it('suppresses user floating utilities on every administrator route', () => {
    expect(floatingUtilities).toContain("pathname === '/admin' || pathname.startsWith('/admin/')");
    expect(floatingUtilities).toContain('<InteractiveOnboardingTracker />');
    expect(floatingUtilities).toContain('<FloatingSupportChatWidget />');
    expect(siteShell).not.toContain('<FloatingSupportChatWidget />');
    expect(rootLayout).not.toContain('<InteractiveOnboardingTracker />');
    expect(rootLayout).toContain('<RouteAwareFloatingUtilities />');
  });

  it('keeps the SEO first render deterministic and its primary actions at a 44px button size', () => {
    expect(seoView).toContain('formatRelativeTime(dateString: string | null, referenceNowMs: number)');
    expect(seoView).toContain('const [relativeTimeNowMs, setRelativeTimeNowMs] = useState(initialNowMs);');
    expect((seoView.match(/size="default"/g) ?? []).length).toBeGreaterThanOrEqual(4);
    expect(indexingApiCard).toContain('useState<SubmissionHistory[]>([])');
    expect(indexingApiCard).not.toContain("id: 'sub-1'");
  });
});
