import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireMember: gate }));
vi.mock('./progression-forms', () => ({
  LoanBoard: () => null, RefreshButton: () => null,
}));
import Page, { metadata } from './page';

const rung = {
  grade: 'C', minimum_account_days: 3, minimum_work_completions: 1,
  credit_limit: '1000', interest_bps: 500, term_days: 30,
  minimum_repayment: '100', held: true,
};

beforeEach(() => { vi.clearAllMocks(); });
async function html(credit: unknown) {
  read.mockImplementation(async (path: string) => path === '/api/v1/progression/credit' ? credit : null);
  return renderToStaticMarkup(await Page());
}

describe('member progression credit rendering', () => {
  it('does not render fake new grade or borrowing CTA for malformed evidence', async () => {
    const rendered = await html({ grade: 'C', ladder: [rung] });
    expect(gate).toHaveBeenCalledOnce();
    expect(rendered).toContain('신용 정보를 확인할 수 없습니다');
    expect(rendered).toContain('신용 정보 다시 조회');
    expect(rendered).not.toContain('지갑에서 대출 신청하기');
    expect(rendered).not.toContain('신규</');
  });
  it('shows a verified C policy with a navigation CTA but never promises loan approval', async () => {
    const rendered = await html({ grade: 'C', loans: [], ladder: [rung] });
    expect(rendered).toContain('지갑에서 대출 신청하기');
    expect(rendered).toContain('C 등급');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it('does not offer borrowing when verified grade is new with zero limit', async () => {
    const rendered = await html({ grade: 'new', loans: [], ladder: [{ ...rung, grade: 'new', credit_limit: '0' }] });
    expect(rendered).not.toContain('지갑에서 대출 신청하기');
    expect(rendered).toContain('신규');
  });
});
