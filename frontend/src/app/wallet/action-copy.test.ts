import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IDLE } from '@/lib/action-state';
import { copyProblems } from '@/lib/copy';

const localeMock = vi.hoisted(() => ({ value: 'en' as string }));
const mutateMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => localeMock.value }));
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  idempotencyKey: () => '99999999-9999-4999-8999-999999999999',
  wholeAmount: (value: FormDataEntryValue | null) =>
    typeof value === 'string' && /^[1-9][0-9]*$/.test(value) ? value : null,
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/api', () => ({ ApiError: class extends Error {} }));

const { transfer, moveBank, borrow, repay, claimDaily } = await import('./actions');
const { ACTION_COPY } = await import('./action-copy');

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [k, v] of Object.entries(values)) data.set(k, v);
  return data;
}

// W02: wallet action results were Korean for every locale. Korean stays byte-identical.
describe('wallet action messages follow the member locale', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('has every message in all five locales', () => {
    expect(copyProblems(ACTION_COPY)).toEqual([]);
  });

  it('answers validation errors in English for an English member', async () => {
    localeMock.value = 'en';
    const results = [
      await transfer(IDLE, form({ recipientUserId: 'x', amount: '1', idempotencyKey: 'k' })),
      await moveBank(IDLE, form({ direction: 'sideways', amount: '1' })),
      await borrow(IDLE, form({ principalAmount: '0' })),
      await repay(IDLE, form({ loanId: 'x', amount: '1' })),
    ];
    for (const r of results) expect(r.message).not.toMatch(/[가-힣]/);
  });

  it('keeps the Korean product copy for a Korean member', async () => {
    localeMock.value = 'ko';
    const r = await transfer(IDLE, form({ recipientUserId: 'x', amount: '1', idempotencyKey: 'k' }));
    expect(r.message).toBe('머니버스 ID 형식(UUID)을 입력해 주세요.');
  });

  it('localises the reward receipt', async () => {
    localeMock.value = 'ja';
    mutateMock.mockResolvedValueOnce({ amount: '10', replayed: false });
    const r = await claimDaily(IDLE);
    expect(r.message).toBe(ACTION_COPY.dailyGranted.ja);
  });
});
