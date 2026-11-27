import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderKo } from '@/testing/render-ko';

vi.mock('next/navigation', () => ({ usePathname: () => '/wallet', useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/components/use-mounted-viewer', () => ({ useMountedViewer: () => ({ signedIn: true }) }));
vi.mock('@/components/language-switcher', () => ({ LanguageSwitcher: () => <span>lang</span> }));
vi.mock('@/components/g1/player-hud', () => ({ PlayerHud: () => <span>hud</span> }));
vi.mock('@/components/passbook/game-date-stamp', () => ({ GameDateStamp: () => <span>stamp</span> }));
vi.mock('@/components/game-sidebar', () => ({ GameSidebar: () => null }));

const { GameTopbar } = await import('./game-topbar');
afterEach(cleanup);

// Browser QA W03 (390 px): the mobile row squeezed the brand mark to 14 px and cut the page name to
// a fragment. The mark never shrinks; the page name (each page also has its own h1) shows only
// where it fits, and the home link keeps its accessible name.
describe('GameTopbar mobile row', () => {
  it('keeps the brand mark whole and shows the page name only where it fits', () => {
    const { container } = renderKo(<GameTopbar />);
    const home = container.querySelector('a[href="/"]')!;
    expect(home.getAttribute('aria-label')).toBeTruthy();
    expect(home.querySelector('img')!.className).toMatch(/\bshrink-0\b/);
    expect(home.querySelector('span')!.className).toMatch(/\bhidden\b/);
    expect(home.querySelector('span')!.className).toMatch(/min-\[420px\]:block/);
  });
});
