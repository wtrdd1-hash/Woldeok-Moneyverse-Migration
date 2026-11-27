import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocaleProvider } from '@/components/locale-provider';
import { copyProblems } from '@/lib/copy';
import type { AdminUser } from './types';

/**
 * Batch 1 of the administrator console localisation: the chrome every /admin route renders, the
 * console home, the member directory and the support desk. Korean stays the product copy; this
 * test proves the other locales are complete and that an English reader sees no Hangul except the
 * member data handed in as props.
 */

const pathname = vi.hoisted(() => ({ current: '/admin/users' }));
const stepUpAction = vi.hoisted(() => ({ name: '' }));

vi.mock('next/navigation', () => ({
  usePathname: () => pathname.current,
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  redirect: vi.fn(),
}));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'en' }));
vi.mock('@/lib/session', () => ({
  adminConsole: vi.fn().mockResolvedValue({ consoleSession: { state: 'open' } }),
  requireAdminConsole: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn().mockResolvedValue(null) }));
vi.mock('./security-actions', () => ({ openConsole: vi.fn(), closeConsole: vi.fn() }));
vi.mock('./support/actions', () => ({ adminSupportReply: vi.fn(), adminSupportStatus: vi.fn() }));
vi.mock('@/lib/audio/synth-sound', () => ({
  synthSound: { playMessageSent: vi.fn(), playClick: vi.fn(), playNotificationChime: vi.fn() },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), loading: vi.fn() } }));
// Shared children localised in a later batch; this batch owns only what it renders itself.
vi.mock('./admin-quick-search', () => ({ AdminQuickUserSearch: () => null }));
vi.mock('./components/telemetry-pulse', () => ({ TelemetryPulse: () => null }));
vi.mock('./components/admin-telemetry-metrics-table', () => ({ AdminTelemetryMetricsTable: () => null }));
vi.mock('./components/admin-comprehensive-telemetry-matrix', () => ({ AdminComprehensiveTelemetryMatrix: () => null }));
vi.mock('./admin-forms', () => ({
  AdminDirectMessageDialog: ({ triggerLabel }: { triggerLabel: string }) => <button type="button">{triggerLabel}</button>,
}));
vi.mock('@/components/admin/admin-stepup-otp-modal', () => ({
  AdminStepupOtpModal: ({ actionName }: { actionName: string }) => {
    stepUpAction.name = actionName;
    return null;
  },
}));

import { ADMIN_CHROME_COPY, ADMIN_HOME_COPY, ADMIN_TAB_COPY, QUICK_JUMPER_COPY } from './admin-copy';
import { ADMIN_AREA_COPY } from './areas';
import { ADMIN_USERS_COPY } from './users/copy';
import { ADMIN_SUPPORT_COPY } from './support/copy';
import { ADMIN_TABS } from '@/components/admin-sub-nav';
import { ALL_ADMIN_ROUTES, AdminQuickJumperModal } from '@/components/admin-quick-jumper-modal';
import { AdminBack } from './admin-back';
import { CloseConsole, OpenConsole } from './console-gate';
import { AdminConsoleFrame } from './layout';
import { UserDirectory } from './users/user-directory';
import { AdminSupportView } from './support/admin-support-view';
import AdminPage from './page';
import AdminUsersPage from './users/page';

const HANGUL = /[가-힣]/;

/** Hangul left in the markup once the member data passed as props is taken out. */
function hangulBeyond(markup: string, data: readonly string[]): string[] {
  let rest = markup;
  for (const value of data) rest = rest.split(value).join('');
  return [...new Set(rest.match(/[가-힣][가-힣\s·]*/g) ?? [])];
}

function renderEn(ui: React.ReactElement) {
  return render(<LocaleProvider initialLocale="en">{ui}</LocaleProvider>);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('administrator console localisation, batch 1', () => {
  it('has every copy table complete in all five locales', () => {
    expect(
      copyProblems({
        ...ADMIN_CHROME_COPY,
        ...ADMIN_HOME_COPY,
        ...ADMIN_TAB_COPY,
        ...QUICK_JUMPER_COPY,
        ...ADMIN_AREA_COPY,
        ...ADMIN_USERS_COPY,
        ...ADMIN_SUPPORT_COPY,
      }),
    ).toEqual([]);
  });

  it('keeps every Korean label byte-identical to the source lists it translates', () => {
    for (const tab of ADMIN_TABS) expect(ADMIN_TAB_COPY[tab.href]?.ko).toBe(tab.label);
    for (const route of ALL_ADMIN_ROUTES) {
      expect(QUICK_JUMPER_COPY[`label:${route.href}`]?.ko).toBe(route.label);
      expect(QUICK_JUMPER_COPY[`desc:${route.href}`]?.ko).toBe(route.description);
      expect(QUICK_JUMPER_COPY[`cat:${route.category}`]?.ko).toBe(route.category);
    }
  });

  it('renders the shared console chrome without Korean for an English reader', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, elevated: false }) }));
    pathname.current = '/admin/economy';
    Element.prototype.scrollIntoView = vi.fn();
    renderEn(
      <AdminConsoleFrame>
        <AdminBack />
        <OpenConsole />
        <CloseConsole />
      </AdminConsoleFrame>,
    );
    expect(hangulBeyond(document.body.innerHTML, [])).toEqual([]);
    expect(HANGUL.test(stepUpAction.name)).toBe(false);
  });

  it('renders the quick jumper dialog without Korean for an English reader', () => {
    pathname.current = '/admin';
    renderEn(<AdminQuickJumperModal />);
    fireEvent.click(screen.getByRole('button', { name: /open/i }));
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(hangulBeyond(document.body.innerHTML, [])).toEqual([]);
  });

  it('renders the member directory with Korean only in member data', () => {
    const users: AdminUser[] = [
      {
        user_id: '00000000-0000-4000-8000-000000000001',
        display_name: '월덕',
        status: 'active',
        created_at: '2026-09-01T00:00:00.000Z',
        restricted_at: '2026-09-03T00:00:00.000Z',
        restriction_reason: '운영 검토 중',
        last_login_at: null,
        last_seen_at: '2026-09-18T11:00:00.000Z',
        last_admin_at: null,
      },
    ];
    renderEn(<UserDirectory users={users} scope={{ kind: 'WEALTH_ORDERED_SNAPSHOT', limit: 50, hasMore: true }} />);
    expect(hangulBeyond(document.body.innerHTML, ['월덕', '운영 검토 중'])).toEqual([]);
  });

  it('renders the support desk with Korean only in thread data', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    renderEn(
      <AdminSupportView
        initialThreads={[
          {
            thread_id: 't1',
            display_name: '회원A',
            subject: '환불 문의',
            status: 'open',
            created_at: '2026-11-20T00:00:00.000Z',
            last_message_at: '2026-11-20T00:00:00.000Z',
          },
        ]}
        initialMessages={[
          { message_id: 'm1', sender_kind: 'user', body: '도와주세요', created_at: '2026-11-20T00:00:00.000Z' },
        ]}
        selectedId="t1"
        initialStatus={null}
      />,
    );
    // The reply box and status select keep Korean accessible names: page.test.ts pins those two
    // literals as the labelling contract, so changing them is a separate, owner-visible decision.
    expect(
      hangulBeyond(document.body.innerHTML, ['회원A', '환불 문의', '도와주세요', 'aria-label="관리자 답장"', 'aria-label="문의 처리 상태"']),
    ).toEqual([]);
  });

  it('renders the console home and the member page server side in English', async () => {
    const home = renderToStaticMarkup(
      <LocaleProvider initialLocale="en">{await AdminPage({ searchParams: Promise.resolve({}) })}</LocaleProvider>,
    );
    expect(hangulBeyond(home, [])).toEqual([]);
    const users = renderToStaticMarkup(<LocaleProvider initialLocale="en">{await AdminUsersPage()}</LocaleProvider>);
    expect(hangulBeyond(users, [])).toEqual([]);
  });
});
