import { describe, expect, it } from 'vitest';
import { activeAdminTab } from './admin-sub-nav';

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

  it('lights nothing for a console page without a tab', () => {
    expect(activeAdminTab('/admin/discord')).toBe('/admin');
    expect(activeAdminTab('/wallet')).toBeNull();
  });
});
