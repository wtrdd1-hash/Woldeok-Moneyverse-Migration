import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

const mocks = vi.hoisted(() => ({
  publicApi: vi.fn(),
  api: vi.fn(),
  isLoggedInMember: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ publicApi: mocks.publicApi, api: mocks.api }));
vi.mock('@/lib/session', () => ({ isLoggedInMember: mocks.isLoggedInMember }));
vi.mock('./funded-treasury-pension-panel', () => ({
  FundedTreasuryPensionPanel: () =>
    createElement('div', { 'data-testid': 'canonical-funded-nps' }, '정식 원장 납입 및 환급'),
}));
vi.mock('./pension-portal-client', () => ({
  PensionPortalClient: () =>
    createElement('div', { 'data-testid': 'legacy-nps-records' }, '과거 기록 확인'),
}));
import PublicPensionPage from './page';

describe('v1742 NPS recovered funded financial entry point', () => {
  beforeEach(() => {
    mocks.publicApi.mockReset().mockResolvedValue(null);
    mocks.api.mockReset().mockRejectedValue(new Error('unavailable'));
    mocks.isLoggedInMember.mockReset();
  });

  it('prioritizes certified funded deposit/refund over held legacy transactions for signed-in members', async () => {
    mocks.isLoggedInMember.mockResolvedValue(true);
    const markup = renderToStaticMarkup(await PublicPensionPage());
    expect(markup).toContain('정식 원장 국민연금 납입·환급');
    expect(markup).toContain('기존 국민연금 기록');
    const fundedIndex = markup.indexOf('data-testid="canonical-funded-nps"');
    const legacyIndex = markup.indexOf('data-testid="legacy-nps-records"');
    expect(fundedIndex).toBeGreaterThan(0);
    expect(legacyIndex).toBeGreaterThan(fundedIndex);
    expect(markup).not.toContain('신규 거래 및 지급은 중단됩니다');
  });

  it('explains actual funding login requirement without exposing mutation controls to guests', async () => {
    mocks.isLoggedInMember.mockResolvedValue(false);
    const markup = renderToStaticMarkup(await PublicPensionPage());
    expect(markup).toContain('로그인 후 정식 원장 국민연금');
    expect(markup).not.toContain('data-testid="canonical-funded-nps"');
    expect(markup).toContain('data-testid="legacy-nps-records"');
  });
});
