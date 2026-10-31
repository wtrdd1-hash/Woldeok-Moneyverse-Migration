import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bankFixture } from './bank-evidence.test';

const read = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../admin-back', () => ({ AdminBack: () => null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }) }));

import AdminBankPage from './page';

describe('bank console real API integration and portfolio scope', () => {
  beforeEach(() => read.mockReset());

  it('fails closed and offers an accessible retry on malformed financial evidence', async () => {
    read.mockResolvedValue({
      ...bankFixture,
      overview: { ...bankFixture.overview, deposit_amount: 'not money' },
    });
    const html = renderToStaticMarkup(await AdminBankPage());
    expect(html).toContain('role="alert"');
    expect(html).toContain('다시 조회');
    expect(html).not.toContain('건전 (Healthy)');
    expect(html).not.toContain('9,007,199,254,740,993');
  });

  it('uses whole-portfolio SQL aggregates, not the limited loan-book sample, for NPL and counts', async () => {
    read.mockResolvedValue(bankFixture);
    const html = renderToStaticMarkup(await AdminBankPage());
    expect(html).toContain('9,007,199,254,740,993');
    expect(html).toContain('10.0%');
    expect(html).toContain('연체 잔액 비율');
    expect(html).toContain('전체 대출 건수');
    expect(html).toContain('100');
    expect(html).toContain('최대 50건');
    expect(html).not.toContain('조회에 실패');
  });
});
