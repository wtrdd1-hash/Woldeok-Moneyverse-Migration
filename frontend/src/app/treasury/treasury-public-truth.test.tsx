import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import TreasuryPage, { metadata } from './page';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/session', () => ({ isLoggedInMember: vi.fn().mockResolvedValue(true) }));

describe('public treasury portal fail-closed disclosure', () => {
  it('does not invent balances, beneficiaries, ledger rows, or member eligibility', async () => {
    const html = renderToStaticMarkup(await TreasuryPage());
    expect(html).toContain('국고 공개 데이터 검증 중');
    expect(html).toContain('role="status"');
    expect(html).toContain('/wallet/activity');
    expect(html).not.toMatch(/25,000,000|3,420,000|1,280,000|disb-101|citi\*\*\*92|1,420명/);
    expect(html).not.toContain('지금 즉시 국고 혜택 수령하기');
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
