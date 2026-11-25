import { describe, expect, it } from 'vitest';
import { ADMIN_AREAS } from '../app/admin/areas';
import { ADMIN_TABS, activeAdminTab } from './admin-sub-nav';
import { ALL_ADMIN_ROUTES } from './admin-quick-jumper-modal';

describe('activeAdminTab', () => {
  it('lights the overview only on its own path', () => {
    expect(activeAdminTab('/admin')).toBe('/admin');
    expect(activeAdminTab('/admin/users')).not.toBe('/admin');
  });

  it('keeps one tab lit inside a nested console page', () => {
    // `/admin` is a prefix of everything here; only the longest match counts.
    expect(activeAdminTab('/admin/users/39fd17cf')).toBe('/admin/users');
    expect(activeAdminTab('/admin/logs/delivery')).toBe('/admin/logs');
  });

  it('matches whole segments, not characters', () => {
    expect(activeAdminTab('/admin/userspace')).toBe('/admin');
  });

  it('lights the newly exposed top-level administrator pages', () => {
    expect(activeAdminTab('/admin/security')).toBe('/admin/security');
    expect(activeAdminTab('/admin/catalog')).toBe('/admin/catalog');
    expect(activeAdminTab('/admin/work')).toBe('/admin/work');
    expect(activeAdminTab('/admin/discord')).toBe('/admin/discord');
  });

  it('lights nothing outside the console', () => {
    expect(activeAdminTab('/wallet')).toBeNull();
  });
});

describe('admin navigation inventory', () => {
  it('exposes every top-level administrator area', () => {
    const tabHrefs = new Set(ADMIN_TABS.map((tab) => tab.href));
    const topLevelAreas = ADMIN_AREAS.filter((area) => area.href.split('/').length === 3);

    expect(topLevelAreas.map((area) => area.href).filter((href) => !tabHrefs.has(href))).toEqual([]);
  });
});


describe('blog administrator entry point', () => {
  it('exposes the existing /admin/blog page in all three navigation inventories', () => {
    expect(ADMIN_TABS.find((tab) => tab.href === '/admin/blog')?.label).toBe('블로그 관리');
    expect(ALL_ADMIN_ROUTES.find((route) => route.href === '/admin/blog')?.label).toBe('블로그 관리');
    expect(ADMIN_AREAS.find((area) => area.href === '/admin/blog')?.title).toContain('블로그 관리');
    expect(activeAdminTab('/admin/blog')).toBe('/admin/blog');
  });

  it('keeps quick-jumper entries unique and includes each top-level admin tab', () => {
    const jumpHrefs = ALL_ADMIN_ROUTES.map((route) => route.href);
    expect(new Set(jumpHrefs).size).toBe(jumpHrefs.length);
    for (const tab of ADMIN_TABS) {
      expect(jumpHrefs).toContain(tab.href);
    }
  });
});

import { adminGroupTabs } from './admin-sub-nav';

/**
 * Owner QA 2026-11-25 §2.3: all 29 console links were drawn as one grid. The
 * DESIGN180 sidebar already lists the eight groups; the strip shows only the
 * pages inside the current group.
 */
describe('adminGroupTabs', () => {
  it('shows only the economy pages inside 경제', () => {
    const hrefs = adminGroupTabs('/admin/central-bank').map((t) => t.href);
    expect(hrefs).toContain('/admin/economy');
    expect(hrefs).toContain('/admin/mint');
    expect(hrefs).not.toContain('/admin/users');
    expect(hrefs.length).toBeLessThan(ADMIN_TABS.length);
  });
  it('shows a single-page group as just that page', () => {
    expect(adminGroupTabs('/admin/support').map((t) => t.href)).toEqual(['/admin/support']);
  });
  it('every console page belongs to exactly one sidebar group', () => {
    const seen = new Map<string, number>();
    for (const tab of ADMIN_TABS) {
      const n = adminGroupTabs(tab.href).some((t) => t.href === tab.href) ? 1 : 0;
      seen.set(tab.href, n);
    }
    expect([...seen].filter(([, n]) => n !== 1)).toEqual([]);
  });
});
