import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const mocks = vi.hoisted(() => ({
  gate: vi.fn(),
  api: vi.fn(),
}));
vi.mock('@/lib/session', () => ({ requireAdminConsole: mocks.gate }));
vi.mock('@/lib/api', () => ({ apiOrNull: mocks.api }));
vi.mock('../../admin-forms', () => ({
  AdminAdjustmentDialog: () => null,
  AdminDirectMessageDialog: () => null,
  ForceLogoutDialog: () => null,
  RestrictionDialog: () => null,
}));
vi.mock('../../security-abuse-forms', () => ({ PermanentSuspensionDialog: () => null }));

import Page, { metadata } from './page';

const ID = 'c23eb10e-4389-42db-91bd-0fbf1a4cc732';
const profile = { portfolio: {
  userId: ID, displayName: 'Verified member', status: 'active',
  createdAt: '2026-10-26T03:00:00.000Z', restrictedAt: null, restrictionReason: null,
} };

async function renderPage() {
  return renderToStaticMarkup(await Page({ params: Promise.resolve({ id: ID }) }));
}

describe('admin member detail page with bounded directory', () => {
  beforeEach(() => { mocks.api.mockReset(); mocks.gate.mockReset(); });

  it('fetches the actor-checked direct profile and shows unknown WLD instead of zero for an out-of-directory member', async () => {
    mocks.api.mockImplementation((path: string) => {
      if (path === '/api/v1/admin/users') return Promise.resolve({ users: [] });
      if (path === `/api/v1/admin/users/${ID}/portfolio`) return Promise.resolve(profile);
      return Promise.resolve({ events: [], nextCursor: null });
    });
    const html = await renderPage();
    expect(mocks.gate).toHaveBeenCalledWith(`/admin/users/${ID}`);
    expect(mocks.api).toHaveBeenCalledWith(`/api/v1/admin/users/${ID}/portfolio`);
    expect(html).toContain('Verified member');
    expect(html).toContain('미확인 금액은');
    expect(html).toContain('role="status"');
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(html).not.toContain('사용자를 찾을 수 없습니다');
    expect(html).not.toContain('0 WLD');
  });

  it('does not render management actions or fabricated member-not-found when direct evidence is unavailable', async () => {
    mocks.api.mockImplementation((path: string) => Promise.resolve(
      path === '/api/v1/admin/users' ? { users: [{ user_id: ID }] } : null,
    ));
    const html = await renderPage();
    expect(html).toContain('회원 상세 정보를 확인할 수 없습니다');
    expect(html).toContain('다시 확인');
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('Verified member');
    expect(html).not.toContain('빠른 관리');
  });
});
