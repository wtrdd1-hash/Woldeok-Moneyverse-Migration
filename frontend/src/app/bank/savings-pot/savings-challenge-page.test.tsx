import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

const { requireMemberMock, apiOrNullMock } = vi.hoisted(() => ({
  requireMemberMock: vi.fn(),
  apiOrNullMock: vi.fn(),
}));
vi.mock('@/lib/session', () => ({ requireMember: requireMemberMock }));
vi.mock('@/lib/api', () => ({ apiOrNull: apiOrNullMock }));

import SavingsChallengePotPage, { metadata } from './page';

describe('member-only verified savings challenge route', () => {
  beforeEach(() => { cleanup(); vi.resetAllMocks(); });

  it('requires session before reading owner-scoped banking standing', async () => {
    requireMemberMock.mockResolvedValue(undefined);
    apiOrNullMock.mockResolvedValue({ bank_balance: '100000', cash_balance: '50000' });
    render(await SavingsChallengePotPage());
    expect(requireMemberMock).toHaveBeenCalledTimes(1);
    expect(apiOrNullMock).toHaveBeenCalledWith('/api/v1/banking/standing');
    expect(screen.getByText('100,000 WLD')).toBeDefined();
  });

  it('fails closed when banking data is missing or malformed', async () => {
    requireMemberMock.mockResolvedValue(undefined);
    apiOrNullMock.mockResolvedValue({ bank_balance: 'invalid', cash_balance: '1000' });
    render(await SavingsChallengePotPage());
    expect(screen.getByRole('alert').textContent).toMatch(/은행 잔액을 확인할 수 없습니다/);
    expect(screen.queryByText('1,000 WLD')).toBeNull();
  });

  it('does not read bank state when authentication rejects', async () => {
    requireMemberMock.mockRejectedValue(new Error('AUTH_REQUIRED'));
    await expect(SavingsChallengePotPage()).rejects.toThrow('AUTH_REQUIRED');
    expect(apiOrNullMock).not.toHaveBeenCalled();
  });

  it('keeps member banking pages out of search indexes', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
