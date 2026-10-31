import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiOrNull, requireMember } = vi.hoisted(() => ({ apiOrNull: vi.fn(), requireMember: vi.fn(async () => undefined) }));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember }));
vi.mock('../wallet-forms', () => ({ LoanList: () => <div data-loan-list="true" /> }));
import BankLoansPage, { metadata } from './page';
beforeEach(() => { vi.clearAllMocks(); apiOrNull.mockResolvedValue({ loans: [] }); });
describe('private owner bank loan status page', () => {
  it('requires membership and renders accessible status links and a bounded scope notice', async () => {
    const html = renderToStaticMarkup(await BankLoansPage({ searchParams: Promise.resolve({ status: 'overdue' }) }));
    expect(requireMember).toHaveBeenCalledOnce();
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/bank/loans?status=overdue');
    expect(html).toContain('aria-label="대출 상태 필터"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('최근 20건');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it('rejects malformed filter echoes and distinguishes unavailable from verified empty', async () => {
    await BankLoansPage({ searchParams: Promise.resolve({ status: ['active', 'overdue'] }) });
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/bank/loans');
    apiOrNull.mockResolvedValueOnce(null);
    const html = renderToStaticMarkup(await BankLoansPage({ searchParams: Promise.resolve({ status: 'active' }) }));
    expect(html).toContain('불러올 수 없');
    expect(html).not.toContain('해당 상태의 대출이 없습니다');
  });
});
