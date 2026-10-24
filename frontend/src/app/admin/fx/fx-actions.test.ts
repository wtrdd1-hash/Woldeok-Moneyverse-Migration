import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  mutate: vi.fn(),
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));
vi.mock('@/lib/session', () => ({ requireAdminConsole: vi.fn() }));

import { api } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { requireAdminConsole } from '@/lib/session';
import { getFxStatus, interveneFx, settleFx, toggleFxHalt } from './actions';

const apiMock = vi.mocked(api);
const mutateMock = vi.mocked(mutate);
const adminMock = vi.mocked(requireAdminConsole);

beforeEach(() => {
  vi.clearAllMocks();
  adminMock.mockResolvedValue({} as Awaited<ReturnType<typeof requireAdminConsole>>);
});

describe('FX server action receipt and authentication contract', () => {
  it('unwraps verified status and checks the admin console', async () => {
    const status = { reserves: { currentRate: 1320, isHalted: false }, history: [], txs: [] };
    apiMock.mockResolvedValue({ success: true, data: status });
    expect(await getFxStatus()).toEqual(status);
    expect(adminMock).toHaveBeenCalledWith('/admin/fx');
    expect(apiMock).toHaveBeenCalledWith('/api/v1/admin/fx/status');
  });

  it('rejects malformed status instead of rendering invented financial values', async () => {
    apiMock.mockResolvedValue({ success: true, data: { reserves: {}, history: [], txs: [] } });
    await expect(getFxStatus()).rejects.toThrow('Unverified FX operation receipt');
  });

  it('does not report a successful intervention without a complete backend receipt', async () => {
    mutateMock.mockResolvedValue({ success: true, data: { newRate: 1320 } });
    expect((await interveneFx('SELL_USD', 50000)).ok).toBe(false);
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/admin/fx/intervene', {
      body: { type: 'SELL_USD', amountUsd: 50000 },
    });
    expect(adminMock).toHaveBeenCalledWith('/admin/fx');
  });

  it('rejects invalid input before any financial mutation', async () => {
    expect((await interveneFx('SELL_USD', Number.POSITIVE_INFINITY)).ok).toBe(false);
    expect((await settleFx('not-an-id')).ok).toBe(false);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('accepts a valid halt receipt only when it matches the requested state', async () => {
    mutateMock.mockResolvedValueOnce({ success: true, data: { isHalted: false } });
    expect((await toggleFxHalt(true)).ok).toBe(false);
    mutateMock.mockResolvedValueOnce({ success: true, data: { isHalted: true } });
    expect((await toggleFxHalt(true)).ok).toBe(true);
  });
});
