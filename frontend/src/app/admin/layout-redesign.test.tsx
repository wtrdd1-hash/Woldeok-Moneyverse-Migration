import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderKo } from '@/testing/render-ko';
import { AdminConsoleFrame as AdminLayout } from './layout';
import AdminGate from './layout';

const viewerMock = vi.hoisted(() => ({ current: { signedIn: false, consentCurrent: false, adminRoles: [] as string[] } }));
vi.mock('@/lib/viewer', () => ({
  currentViewer: async () => viewerMock.current,
  isAdministrator: (v: { signedIn: boolean; consentCurrent: boolean; adminRoles: string[] }) =>
    v.signedIn && v.consentCurrent && v.adminRoles.length > 0,
}));
vi.mock('next/navigation', () => ({
  redirect: (to: string) => { throw new Error('REDIRECT:' + to); },
  notFound: () => { throw new Error('NOT_FOUND'); },
}));

vi.mock('@/components/admin-sub-nav', () => ({
  AdminSubNav: () => <nav data-testid="admin-sub-nav">Admin links</nav>
}));

describe('Admin layout visual transition', () => {
  it('wraps the original admin navigation and content in a scoped v2 theme', () => {
    const { container } = renderKo(<AdminLayout><p>Protected original content</p></AdminLayout>);
    expect(container.querySelector('[data-admin-theme="g1-gm"]')).not.toBeNull();
    expect(screen.getByTestId('admin-sub-nav')).toBeDefined();
    expect(screen.getByText('Protected original content')).toBeDefined();
    // DESIGN180 has no console banner (owner QA 2026-11-25).
    expect(screen.queryByText('GM 콘솔')).toBeNull();
  });

  it('has a visible non-fabricated status disclaimer rather than pretending backend is healthy', () => {
    renderKo(<AdminLayout><p>Protected data</p></AdminLayout>);
    expect(screen.getByText(/서비스 상태는 각 관리자 API의 실제 조회 결과를 기준으로 표시/)).toBeDefined();
  });
});

describe('Admin layout server gate', () => {
  it('sends a signed-out visitor to login without rendering console navigation', async () => {
    viewerMock.current = { signedIn: false, consentCurrent: false, adminRoles: [] };
    await expect(AdminGate({ children: <p>x</p> })).rejects.toThrow('REDIRECT:/login?next=%2Fadmin');
  });

  it('answers 404 to a signed-in member without an administrator role', async () => {
    viewerMock.current = { signedIn: true, consentCurrent: true, adminRoles: [] };
    await expect(AdminGate({ children: <p>x</p> })).rejects.toThrow('NOT_FOUND');
  });

  it('renders the console frame for an administrator', async () => {
    viewerMock.current = { signedIn: true, consentCurrent: true, adminRoles: ['superadmin'] };
    renderKo(await AdminGate({ children: <p>Admin content</p> }));
    expect(screen.getByTestId('admin-sub-nav')).toBeDefined();
    expect(screen.getByText('Admin content')).toBeDefined();
  });
});
