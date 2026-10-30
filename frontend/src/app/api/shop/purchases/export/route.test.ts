import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));

const purchase = {
  purchaseId: '00000000-0000-4000-8000-000000000002',
  itemId: '00000000-0000-4000-8000-000000000003',
  itemName: '상품, 이름',
  transactionId: '00000000-0000-4000-8000-000000000004',
  amount: '9007199254740993',
  purchasedAt: '2026-10-30T03:00:00.000Z',
};

beforeEach(() => vi.clearAllMocks());

describe('member purchase CSV download', () => {
  it('forwards bounded search, verifies receipts and emits private CSV', async () => {
    vi.mocked(api).mockResolvedValue({ scope: 'recent100', purchases: [purchase] });
    const response = await GET(
      new Request('https://example.test/api/shop/purchases/export?q=%EC%83%81%ED%92%88'),
    );
    expect(api).toHaveBeenCalledWith('/api/v1/shop/purchases/export?q=%EC%83%81%ED%92%88');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(await response.text()).toContain('9007199254740993');
  });
  it('fails closed on malformed backend 200 or transport failure', async () => {
    vi.mocked(api).mockResolvedValue({ scope: 'recent100', purchases: [{ amount: 1 }] });
    const malformed = await GET(new Request('https://example.test/api/shop/purchases/export'));
    expect(malformed.status).toBe(503);
    expect(malformed.headers.get('cache-control')).toBe('private, no-store');
    vi.mocked(api).mockRejectedValue(new Error('backend offline'));
    expect((await GET(new Request('https://example.test/api/shop/purchases/export'))).status).toBe(
      503,
    );
  });
  it('rejects duplicate and overlong query before backend access', async () => {
    for (const query of ['q=a&q=b', 'q=' + 'x'.repeat(81), 'q=a%0Ab']) {
      vi.mocked(api).mockClear();
      const response = await GET(
        new Request('https://example.test/api/shop/purchases/export?' + query),
      );
      expect(response.status).toBe(400);
      expect(api).not.toHaveBeenCalled();
    }
  });
});
