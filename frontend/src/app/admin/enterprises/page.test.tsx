import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validLog, validOverview, validPrivate, validSoe } from './enterprise-evidence-fixtures';
import { EnterpriseControlTower } from './enterprise-control-tower';
import Page from './page';

const mocks = vi.hoisted(() => ({ apiOrNull: vi.fn(), requireAdminConsole: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: mocks.apiOrNull }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: mocks.requireAdminConsole }));
vi.mock('./enterprise-control-tower', () => ({ EnterpriseControlTower: () => null }));

describe('admin enterprise page verified API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('passes all four validated backend datasets to the control tower', async () => {
    mocks.apiOrNull
      .mockResolvedValueOnce(validOverview)
      .mockResolvedValueOnce([validSoe])
      .mockResolvedValueOnce([validPrivate])
      .mockResolvedValueOnce([validLog]);
    const element = await Page();
    expect(mocks.requireAdminConsole).toHaveBeenCalledWith('/admin/enterprises');
    expect(element.props.children[2].type).toBe(EnterpriseControlTower);
    expect(element.props.children[2].props.initialDividendLogs).toHaveLength(1);
  });
  it('does not render a false empty dividend history when the API fails', async () => {
    mocks.apiOrNull
      .mockResolvedValueOnce(validOverview)
      .mockResolvedValueOnce([validSoe])
      .mockResolvedValueOnce([validPrivate])
      .mockResolvedValueOnce(null);
    const element = await Page();
    expect(element.props.children[2].type).not.toBe(EnterpriseControlTower);
    expect(JSON.stringify(element.props.children[2].props)).toContain('다시');
  });
});
