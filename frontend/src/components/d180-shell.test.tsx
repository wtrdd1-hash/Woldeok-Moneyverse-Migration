import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, within } from '@testing-library/react';
import { renderKo } from '@/testing/render-ko';

/**
 * DESIGN180 shell (plan task 2): member navigation with Tools, a separate
 * administrator navigation shown only to a server-reported administrator on
 * /admin routes, a five-tab dock (홈·퀘스트·거래소·지갑·계정) and no G2 strip.
 */

let pathname = '/';
let viewer: unknown = { signedIn: false, consentCurrent: false, adminRoles: [] };

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/components/use-mounted-viewer', () => ({ useMountedViewer: () => viewer }));
vi.mock('@/lib/viewer-state', () => ({
  isAdministrator: (v: { adminRoles?: string[] }) => (v.adminRoles ?? []).length > 0,
}));
vi.mock('@/components/language-switcher', () => ({ LanguageSwitcher: () => <span>언어</span> }));
vi.mock('@/components/client-error-reporter', () => ({ ClientErrorReporter: () => null }));
vi.mock('@/components/g1/player-hud', () => ({ PlayerHud: () => <span>hud</span> }));

const { GameSidebar } = await import('./game-sidebar');
const { GameMobileDock } = await import('./game-mobile-dock');
const { SiteShell } = await import('./site-shell');

const MEMBER = ['홈', '지갑', '은행', '거래소', '퀘스트', '상점', '광장', '계산기', '내 계정'];
const ADMIN = ['개요', '회원', '경제', '상점', '콘텐츠', '문의', '보안', '감사 기록'];

function navLabels(): string[] {
  const nav = screen.getByRole('navigation', { name: /메뉴/ });
  return within(nav).getAllByRole('link').map((a) => a.textContent?.trim() ?? '');
}

describe('DESIGN180 shell', () => {
  afterEach(() => {
    cleanup();
    pathname = '/';
    viewer = { signedIn: false, consentCurrent: false, adminRoles: [] };
  });

  it('shows the member navigation in DESIGN180 order', () => {
    renderKo(<GameSidebar />);
    expect(navLabels()).toEqual(MEMBER);
  });

  it('shows the administrator navigation to an administrator on /admin', () => {
    pathname = '/admin/users';
    viewer = { signedIn: true, consentCurrent: true, adminRoles: ['SUPERADMIN'] };
    renderKo(<GameSidebar />);
    const labels = navLabels();
    expect(labels.slice(0, ADMIN.length)).toEqual(ADMIN);
    expect(screen.getByRole('link', { name: '회원' }).getAttribute('aria-current')).toBe('page');
  });

  it('never shows the administrator navigation to a member, even on /admin', () => {
    pathname = '/admin/users';
    viewer = { signedIn: true, consentCurrent: true, adminRoles: [] };
    renderKo(<GameSidebar />);
    expect(navLabels()).toEqual(MEMBER);
  });

  it('has a five-tab dock: 홈 퀘스트 거래소 지갑 계정', () => {
    renderKo(<GameMobileDock />);
    const links = within(screen.getByRole('navigation', { name: '하단 메뉴' })).getAllByRole('link');
    expect(links.map((a) => a.textContent?.trim())).toEqual(['홈', '퀘스트', '거래소', '지갑', '계정']);
  });

  // ui-ux-pro-max "Compact Label Overflow": a dock label stays on one line and shrinks with an
  // ellipsis instead of wrapping (browser QA: VI wrapped at 320 px); the link keeps the full name.
  it('keeps dock labels on one shrinkable line', () => {
    renderKo(<GameMobileDock />);
    const links = within(screen.getByRole('navigation', { name: '하단 메뉴' })).getAllByRole('link');
    for (const link of links) {
      expect(link.className).toContain('min-w-0');
      expect(link.querySelector('span')?.className).toMatch(/\btruncate\b/);
    }
  });

  // Browser QA W03: the root layout already renders the skip link to #main; a second one in the
  // shell made keyboard users tab through two identical links.
  it('leaves the skip link to the root layout', () => {
    const { container } = renderKo(<SiteShell><p>본문</p></SiteShell>);
    expect(container.querySelectorAll('a[href="#main"]')).toHaveLength(0);
  });

  it('no longer renders the G2 ledger strip', () => {
    renderKo(<SiteShell><p>본문</p></SiteShell>);
    expect(screen.queryByRole('region', { name: '원장 상태' })).toBeNull();
  });
});
