import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutateMock = vi.hoisted(() => vi.fn());
const revalidateMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  idempotencyKey: () => 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
  wholeAmount: (value: FormDataEntryValue | null) => typeof value === 'string' ? value : null,
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));
import { customizePocketAction } from './actions';

const key = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const pocket = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const idle = { status: 'idle' as const, message: '' };
function form(idempotencyKey: string | null) {
  const data = new FormData();
  data.set('pocketId', pocket);
  data.set('themeColor', 'emerald');
  data.set('iconCode', 'wallet');
  if (idempotencyKey !== null) data.set('idempotencyKey', idempotencyKey);
  return data;
}

describe('paid pocket customization request identity', () => {
  beforeEach(() => { vi.clearAllMocks(); mutateMock.mockResolvedValue({ cost_wld: '400' }); });

  it('forwards the original client intent UUID unchanged for identical retry', async () => {
    await customizePocketAction(idle, form(key));
    await customizePocketAction(idle, form(key));
    expect(mutateMock).toHaveBeenCalledTimes(2);
    for (const [, request] of mutateMock.mock.calls) {
      expect(request).toEqual({ method: 'PUT', body: { themeColor: 'emerald', iconCode: 'wallet', idempotencyKey: key } });
    }
  });

  it('rejects absent, nil and invalid keys before any financial request', async () => {
    for (const invalid of [null, '00000000-0000-0000-0000-000000000000', 'not-a-uuid']) {
      expect((await customizePocketAction(idle, form(invalid))).status).toBe('error');
    }
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('never reports success when the backend rejects a request', async () => {
    mutateMock.mockRejectedValueOnce(new Error('DB unavailable'));
    expect((await customizePocketAction(idle, form(key))).status).toBe('error');
    expect(revalidateMock).not.toHaveBeenCalled();
  });
});
