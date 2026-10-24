import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Page, { metadata } from './page';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => {}) }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn(async () => 'ko') }));

const bondId = '0a0a0a0a-0000-4000-8000-000000000001';
const preview = {
  bondId,
  bondName: '7-day virtual bond',
  principalAmount: '1000',
  maturityAmount: '1030',
  currentCashBalance: '9000',
  projectedCashBalance: '10030',
  maturityAt: '2026-10-25T00:00:00.000Z',
  maturityStatus: 'MATURED',
  eligibleForRedemption: true,
  previewOnly: true,
  payoutGuaranteed: false,
};

beforeEach(() => { vi.clearAllMocks(); });

describe('private bond redemption preview page', () => {
  it('is noindex and requires a member before requesting any bond data', async () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
    vi.mocked(apiOrNull).mockResolvedValue(preview);
    const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ bondId }) }));
    expect(requireMember).toHaveBeenCalledTimes(1);
    expect(apiOrNull).toHaveBeenCalledWith(`/api/v1/banking/bonds/${bondId}/redemption-preview`);
    expect(html).toContain('1,030 WLD');
  });

  it('does not call the backend for malformed bond ids or invent payout on failure', async () => {
    const invalid = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ bondId: '../bad' }) }));
    expect(invalid).toContain('불러올 수 없습니다');
    expect(apiOrNull).not.toHaveBeenCalled();
    vi.mocked(apiOrNull).mockResolvedValue(null);
    const unavailable = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ bondId }) }));
    expect(unavailable).not.toContain('지급 완료');
  });

  it('rejects a mismatched owner quote instead of displaying it', async () => {
    vi.mocked(apiOrNull).mockResolvedValue({ ...preview, bondId: '0a0a0a0a-0000-4000-8000-000000000002' });
    const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ bondId }) }));
    expect(html).toContain('불러올 수 없습니다');
  });
});
