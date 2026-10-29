import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

const { mutate, revalidate } = vi.hoisted(() => ({ mutate: vi.fn(), revalidate: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  mutate,
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));

import { reportConversationAction } from './actions';

const conversation = '11111111-1111-4111-8111-111111111111';
const receiptId = '22222222-2222-4222-8222-222222222222';

beforeEach(() => vi.clearAllMocks());

describe('private chat abuse report receipt', () => {
  it.each([
    {}, { ok: false, reportId: receiptId }, { ok: 'true', reportId: receiptId },
    { ok: true }, { ok: true, reportId: null }, { ok: true, reportId: 'not-a-uuid' },
    { ok: true, reportId: '00000000-0000-0000-0000-000000000000' },
  ])('never claims evidence preserved for unverified receipt %j', async (receipt) => {
    mutate.mockResolvedValue(receipt);
    const result = await reportConversationAction(conversation, 'fraud_scam', '의심스러운 송금 요구');
    expect(result.status).toBe('error');
    expect(result.reportId).toBeUndefined();
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('returns exact canonical database report UUID only after verified receipt', async () => {
    mutate.mockResolvedValue({ ok: true, reportId: receiptId });
    const result = await reportConversationAction(conversation, 'fraud_scam', '의심스러운 송금 요구');
    expect(result).toMatchObject({ status: 'ok', reportId: receiptId });
    expect(mutate).toHaveBeenCalledWith(`/api/v1/chat/conversations/${conversation}/report`, {
      body: { reason: 'fraud_scam', details: '의심스러운 송금 요구' },
    });
    expect(revalidate).toHaveBeenCalledWith('/chat');
  });

  it.each([['invalid_reason', 'details'], ['fraud_scam', 'x'.repeat(2001)]])(
    'rejects invalid report input before posting', async (reason, details) => {
      const result = await reportConversationAction(conversation, reason, details);
      expect(result.status).toBe('error');
      expect(mutate).not.toHaveBeenCalled();
    },
  );

  it('keeps failure feedback accessible without closing the report dialog', () => {
    const room = readFileSync('src/app/chat/chat-room.tsx', 'utf8');
    expect(room).toContain('role="alert"');
    expect(room).toContain('setReportError(res.message)');
    expect(room).toContain('min-h-11');
  });
});
