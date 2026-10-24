import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: vi.fn() }));

const signedIn = { signedIn: true, consentCurrent: true, adminRoles: [] };
const transaction = {
  transactionId: '22222222-2222-4222-8222-222222222222',
  type: 'BANK_DEPOSIT', label: '=HYPERLINK("https://invalid.test")',
  netAmount: '0', cashDelta: '-90071992547409931234567890123456789012',
  bankDelta: '90071992547409931234567890123456789012',
  direction: 'neutral', occurredAt: '2026-10-24T00:00:00.000Z',
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(viewerOrUnknown).mockResolvedValue(signedIn);
  vi.mocked(api).mockResolvedValue({ currency: 'WLD', recentLimit: 50, generatedAt: '2026-10-24T01:00:00Z', transactions: [transaction] });
});

describe('private server-verified recent ledger CSV', () => {
  it('downloads the latest 50 owner rows with exact WLD and safe formula cells', async () => {
    const response = await GET(new Request('https://example.test/api/wallet/export?lang=en'));
    expect(api).toHaveBeenCalledExactlyOnceWith('/api/v1/wallet/transactions/export');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    const csv = await response.text();
    expect(csv).toContain('Cash delta (WLD)');
    expect(csv).toContain('90071992547409931234567890123456789012');
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).not.toContain('"=HYPERLINK');
  });

  it('never exports when signed out or viewer state is unknown', async () => {
    vi.mocked(viewerOrUnknown).mockResolvedValueOnce({ signedIn: false, consentCurrent: false, adminRoles: [] });
    const denied = await GET(new Request('https://example.test/api/wallet/export'));
    expect(denied.status).toBe(401);
    vi.mocked(viewerOrUnknown).mockResolvedValueOnce(null);
    const unknown = await GET(new Request('https://example.test/api/wallet/export'));
    expect(unknown.status).toBe(503);
    expect(api).not.toHaveBeenCalled();
  });

  it('fails closed when backend is unavailable or response exceeds 50 rows', async () => {
    vi.mocked(api).mockRejectedValueOnce(new Error('backend offline'));
    const unavailable = await GET(new Request('https://example.test/api/wallet/export'));
    expect(unavailable.status).toBe(503);
    vi.mocked(api).mockResolvedValueOnce({ currency: 'WLD', recentLimit: 50, transactions: Array(51).fill(transaction) });
    const overLimit = await GET(new Request('https://example.test/api/wallet/export'));
    expect(overLimit.status).toBe(503);
  });

  it('fails closed on malformed WLD strings instead of a false zero export', async () => {
    vi.mocked(api).mockResolvedValueOnce({ currency: 'WLD', recentLimit: 50, transactions: [{ ...transaction, netAmount: '01' }] });
    const response = await GET(new Request('https://example.test/api/wallet/export'));
    expect(response.status).toBe(503);
  });
});
