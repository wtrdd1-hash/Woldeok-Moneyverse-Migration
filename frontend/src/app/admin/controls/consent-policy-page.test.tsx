import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { apiOrNull } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import AdminControlsPage from './page';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: vi.fn() }));
vi.mock('./policy-version-card', () => ({
  PolicyVersionCard: ({ isSuperadmin }: { isSuperadmin: boolean }) =>
    <span data-testid="policy-card" data-publish={isSuperadmin ? 'yes' : 'no'} />,
}));
vi.mock('./controls-forms', () => ({
  ActivateDuePoliciesForm: () => null,
  FeatureSwitchDialog: () => null,
  NewPolicyVersionForm: () => null,
  PolicyRollbackDialog: () => null,
  RoleDesignationForm: () => null,
  SwitchStateBadge: () => null,
}));
vi.mock('./emergency-kill-switch-card', () => ({ EmergencyKillSwitchCard: () => null }));
vi.mock('./hot-time-management-card', () => ({ HotTimeManagementCard: () => null }));
vi.mock('../admin-back', () => ({ AdminBack: () => null }));

const valid = { termsVersion: '2026-10-27', privacyVersion: '2026-10-27' };

function mockApi(policy: unknown, roles: string[]) {
  vi.mocked(requireAdminConsole).mockResolvedValue({ roles } as never);
  vi.mocked(apiOrNull).mockImplementation(async (path) =>
    path === '/auth/policy' ? policy as never : null as never);
}

beforeEach(() => vi.resetAllMocks());

describe('admin controls consent policy integration', () => {
  it('does not render any publication control when the API is unavailable', async () => {
    mockApi(null, ['superadmin']);
    const html = renderToStaticMarkup(await AdminControlsPage());
    expect(html).toContain('role="alert"');
    expect(html).toContain('개정 기능을 중단');
    expect(html).not.toContain('data-testid="policy-card"');
    expect(html).not.toContain('2026-09-02');
  });

  it('rejects malformed policy versions even when the caller is superadmin', async () => {
    mockApi({ termsVersion: 123, privacyVersion: '2026-10-27' }, ['superadmin']);
    const html = renderToStaticMarkup(await AdminControlsPage());
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('data-testid="policy-card"');
  });

  it('renders verified versions without a privileged action for operators', async () => {
    mockApi(valid, ['operator']);
    const html = renderToStaticMarkup(await AdminControlsPage());
    expect(html).toContain('data-publish="no"');
  });

  it('allows a verified superadmin to see the existing guarded publication action', async () => {
    mockApi(valid, ['superadmin']);
    const html = renderToStaticMarkup(await AdminControlsPage());
    expect(html).toContain('data-publish="yes"');
  });
});
