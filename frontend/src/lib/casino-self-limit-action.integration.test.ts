import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  mutate: vi.fn(),
  idempotencyKey: vi.fn(() => 'request-key'),
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { setSelfLimit as arcadeLimit } from '@/app/arcade/actions';
import { setSelfLimit as casinoLimit } from '@/app/casino/actions';

const persisted = { daily_bet_limit: '1000', daily_loss_limit: '500', locked_until: null };
const form = () => {
  const data = new FormData();
  data.set('dailyBetLimit', '1000');
  data.set('dailyLossLimit', '500');
  data.set('lock', 'none');
  return data;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(mutate).mockResolvedValue(persisted);
  vi.mocked(api).mockResolvedValue(persisted);
});

describe.each([
  ['arcade', arcadeLimit],
  ['casino', casinoLimit],
] as const)('%s member protection action', (_route, action) => {
  it('only confirms after authenticated GET returns the persisted cap', async () => {
    const result = await action({ status: 'idle' }, form());
    expect(result.status).toBe('ok');
    expect(api).toHaveBeenCalledWith('/api/v1/casino/self-limit');
    expect(mutate).toHaveBeenCalledWith('/api/v1/casino/self-limit', expect.objectContaining({ method: 'PUT' }));
    expect(revalidatePath).toHaveBeenCalled();
  });

  it('refuses success when the API echoes input but the stored cap differs', async () => {
    vi.mocked(api).mockResolvedValue({ ...persisted, daily_bet_limit: '900' });
    const result = await action({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(result.message).toContain('저장 여부');
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('refuses success when the PUT receipt contradicts the requested cap', async () => {
    vi.mocked(mutate).mockResolvedValue({ ...persisted, daily_loss_limit: '100' });
    expect((await action({ status: 'idle' }, form())).status).toBe('error');
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('never reports success when the readback request fails', async () => {
    vi.mocked(api).mockRejectedValue(new Error('read unavailable'));
    const result = await action({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(result.message).toContain('저장 여부');
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
