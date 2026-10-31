import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiOrNull } from '@/lib/api';
import { currentViewer } from '@/lib/viewer';
import { GET } from './route';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ currentViewer: vi.fn() }));

const wallet = (amount: unknown, currency: unknown = 'WLD') => ({
  balances: { currency, totalAvailableAmount: amount },
});

function expectPrivate(response: Response) {
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
}

describe('owner wallet glance source contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(currentViewer).mockResolvedValue({ signedIn: true } as never);
  });

  it('preserves an exact large canonical WLD amount without Number conversion', async () => {
    const amount = '900719925474099312345678901234567890';
    vi.mocked(apiOrNull).mockResolvedValue(wallet(amount) as never);
    const response = await GET();
    expect(response.status).toBe(200);
    expectPrivate(response);
    expect(await response.json()).toEqual({ signedIn: true, currency: 'WLD', totalAvailableAmount: amount });
  });

  it.each([
    ['numeric rounded amount', wallet(Number.MAX_SAFE_INTEGER + 2)],
    ['noncanonical leading zero', wallet('00012')],
    ['scientific notation', wallet('1e9')],
    ['invalid currency', wallet('500', 'USD')],
    ['missing balances', {}],
    ['missing amount', { balances: { currency: 'WLD' } }],
    ['non-object payload', 'invalid'],
  ])('never reports an unverified %s as an owner balance', async (_case, payload) => {
    vi.mocked(apiOrNull).mockResolvedValue(payload as never);
    const response = await GET();
    expect(response.status).toBe(200);
    expectPrivate(response);
    expect(await response.json()).toEqual({ signedIn: true, currency: null, totalAvailableAmount: null });
  });

  it('preserves the unavailable state when the upstream cannot be reached', async () => {
    vi.mocked(apiOrNull).mockResolvedValue(null);
    const response = await GET();
    expectPrivate(response);
    expect(await response.json()).toEqual({ signedIn: true, currency: null, totalAvailableAmount: null });
  });

  it('never queries an owner wallet for a signed-out viewer', async () => {
    vi.mocked(currentViewer).mockResolvedValue({ signedIn: false } as never);
    const response = await GET();
    expectPrivate(response);
    expect(await response.json()).toEqual({ signedIn: false, currency: null, totalAvailableAmount: null });
    expect(apiOrNull).not.toHaveBeenCalled();
  });
});
