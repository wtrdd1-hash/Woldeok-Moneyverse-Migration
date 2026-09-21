import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const aiStatus = readFileSync('src/app/admin/economy/ai-status-card.tsx', 'utf8');
const traffic = readFileSync('src/app/admin/logs/activity/traffic-dashboard.tsx', 'utf8');
const activity = readFileSync('src/app/admin/logs/activity/page.tsx', 'utf8');

const subNav = readFileSync('src/components/admin-sub-nav.tsx', 'utf8');
const userDirectory = readFileSync('src/app/admin/users/user-directory.tsx', 'utf8');
const market = readFileSync('src/app/admin/market/page.tsx', 'utf8');
const support = readFileSync('src/app/admin/support/page.tsx', 'utf8');
const workForms = readFileSync('src/app/admin/work/admin-work-forms.tsx', 'utf8');

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

  it('uses safe negative margin and hidden scrollbars for admin sub nav on mobile', () => {
    expect(subNav).toContain('-mx-3 mb-4 overflow-x-auto');
    expect(subNav).toContain('scrollbar-none touch-pan-x overscroll-x-contain');
  });

  it('preserves horizontal scrolling with minimum widths for market and work console tables', () => {
    expect(market).toContain('min-w-[580px]');
    expect(market).toContain('min-w-[720px]');
    expect(workForms).toContain('min-w-[720px]');
  });

  it('provides smooth horizontal scrollbars for user directory sort tabs and support chat tabs', () => {
    expect(userDirectory).toContain('flex-nowrap overflow-x-auto no-scrollbar');
    expect(support).toContain('flex flex-nowrap overflow-x-auto no-scrollbar');
    expect(support).toContain('max-h-72 lg:max-h-none overflow-y-auto');
  });
});
