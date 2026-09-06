import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/actions', () => ({ logout: vi.fn() }));
import { MobileSessionAction, mobileAdminEntries } from './site-header';

afterEach(cleanup);

describe('mobile session navigation', () => {
  it('never exposes an admin entry to a regular signed-in member', () => {
    expect(
      mobileAdminEntries({ signedIn: true, consentCurrent: true, adminRoles: [] }),
    ).toEqual([]);
  });

  it('shows the complete operations menu to a confirmed administrator', () => {
    const entries = mobileAdminEntries({
      signedIn: true,
      consentCurrent: true,
      adminRoles: ['operator'],
    });
    expect(entries.length).toBeGreaterThan(1);
    expect(entries[0]?.href).toBe('/admin');
  });

  it('shows a login action to a signed-out reader', () => {
    render(
      <MobileSessionAction
        viewer={{ signedIn: false, consentCurrent: false, adminRoles: [] }}
        locale="ko"
      />,
    );
    expect(screen.getByRole('link', { name: '로그인' }).getAttribute('href')).toBe('/login');
  });

  it('shows a logout action to a signed-in member', () => {
    render(
      <MobileSessionAction
        viewer={{ signedIn: true, consentCurrent: true, adminRoles: [] }}
        locale="ko"
      />,
    );
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeDefined();
  });
});
