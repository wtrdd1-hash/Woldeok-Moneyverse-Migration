import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({
  mutate: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath: mock.revalidatePath }));
vi.mock('@/lib/mutate', () => ({
  mutate: mock.mutate,
  failure: (_error: unknown, message: string) => ({ status: 'error', message }),
  idempotencyKey: () => 'test-key',
  wholeNumber: () => 1,
}));

import { setWatchlist } from './actions';

function input(watching: boolean) {
  const data = new FormData();
  data.set('stockId', 'c3a6f5c5-3a90-44b1-bb70-b4e82452e09b');
  data.set('watching', String(watching));
  return data;
}

describe('verified stock watchlist mutation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires a matching persisted backend receipt before claiming success', async () => {
    mock.mutate.mockResolvedValueOnce({ watching: false });
    const result = await setWatchlist({ status: 'idle' }, input(true));
    expect(result.status).toBe('error');
    expect(mock.revalidatePath).not.toHaveBeenCalled();
  });

  it('rejects missing or invalid receipts rather than inventing success', async () => {
    mock.mutate.mockResolvedValueOnce({});
    expect((await setWatchlist({ status: 'idle' }, input(true))).status).toBe('error');
    mock.mutate.mockResolvedValueOnce({ watching: 'true' });
    expect((await setWatchlist({ status: 'idle' }, input(true))).status).toBe('error');
    expect(mock.revalidatePath).not.toHaveBeenCalled();
  });

  it('confirms server-persisted addition and refreshes every watchlist view', async () => {
    mock.mutate.mockResolvedValue({ watching: true });
    const result = await setWatchlist({ status: 'idle' }, input(true));
    expect(result.status).toBe('ok');
    expect(mock.revalidatePath).toHaveBeenCalledWith('/stocks');
    expect(mock.revalidatePath).toHaveBeenCalledWith('/stocks/watchlist');
    expect(mock.revalidatePath).toHaveBeenCalledWith('/stocks/[symbol]', 'page');
  });

  it('confirms server-persisted removal and reports API failures', async () => {
    mock.mutate.mockResolvedValueOnce({ watching: false });
    expect((await setWatchlist({ status: 'idle' }, input(false))).status).toBe('ok');
    mock.mutate.mockRejectedValueOnce(new Error('backend unavailable'));
    expect((await setWatchlist({ status: 'idle' }, input(false))).status).toBe('error');
  });
});
