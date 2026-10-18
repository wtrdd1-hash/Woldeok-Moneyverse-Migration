import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutateMock = vi.hoisted(() => vi.fn());
const revalidateMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  idempotencyKey: () => 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  wholeAmount: (value: FormDataEntryValue | null) => {
    if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value)) return null;
    return value;
  },
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));
import { depositAction } from './actions';

function form(amount: string) {
  const formData = new FormData();
  formData.set('amount', amount);
  return formData;
}

const idle = { status: 'idle' as const, message: '' };

describe('real WLD deposit server action', () => {
  beforeEach(() => { vi.clearAllMocks(); mutateMock.mockResolvedValue({}); });

  it('calls the backend ledger deposit with a stable request key and refreshes balances', async () => {
    const result = await depositAction(idle, form('100'));
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/banking/deposit', {
      body: { amount: '100', idempotencyKey: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
    });
    expect(revalidateMock).toHaveBeenCalledWith('/bank');
    expect(revalidateMock).toHaveBeenCalledWith('/wallet');
    expect(result.status).toBe('ok');
  });

  it('fails closed without calling the API for zero or invalid amounts', async () => {
    expect((await depositAction(idle, form('0'))).status).toBe('error');
    expect((await depositAction(idle, form('-100'))).status).toBe('error');
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('does not display false success after backend rejection', async () => {
    mutateMock.mockRejectedValueOnce(new Error('insufficient balance'));
    expect((await depositAction(idle, form('100'))).status).toBe('error');
    expect(revalidateMock).not.toHaveBeenCalled();
  });
});
