import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ apiOrNull: apiMock }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: vi.fn(async () => undefined) }));
vi.mock('../../admin-back', () => ({ AdminBack: () => <div>Back</div> }));
vi.mock('../logs-sub-nav', () => ({ LogsSubNav: () => <nav>Logs</nav> }));
vi.mock('./integrity-forms', () => ({
  DispositionForm: () => <div data-testid="disposition-form">Disposition form</div>,
  RetentionPolicyDialog: () => <button>Change policy</button>,
  VerificationBadge: () => <span>Verified</span>,
  VerifyChainForm: () => <div>Verify chain</div>,
}));
import AdminAuditIntegrityPage from './page';

describe('admin audit evidence rendering', () => {
  beforeEach(() => apiMock.mockReset());

  it('fails closed on malformed retention and hides privileged mutation controls', async () => {
    apiMock.mockImplementation(async (url: string) => {
      if (typeof url === "string" && url.endsWith('/retention')) return { categories: [{ category: 'admin', retention_days: '90' }] };
      if (typeof url === "string" && url.endsWith('/verifications')) return { verifications: [] };
      return { dispositions: [] };
    });
    const html = renderToStaticMarkup(await AdminAuditIntegrityPage());
    expect(html).toContain('조회 실패 또는 응답 무결성 오류');
    expect(html).not.toContain('Change policy');
    expect(html).not.toContain('Disposition form');
    expect(html).toContain('role="alert"');
    expect(html).toContain('다시 조회');
  });

  it('distinguishes verified empty evidence from unavailable evidence', async () => {
    apiMock.mockImplementation(async (url: string) => {
      if (typeof url === "string" && url.endsWith('/retention')) return { categories: [] };
      if (typeof url === "string" && url.endsWith('/verifications')) return { verifications: [] };
      return { dispositions: [] };
    });
    const html = renderToStaticMarkup(await AdminAuditIntegrityPage());
    expect(html).toContain('아직 실행한 검증이 없습니다.');
    expect(html).toContain('등록된 보존 정책이 없습니다.');
    expect(html).not.toContain('조회 실패 또는 응답 무결성 오류');
  });
});
