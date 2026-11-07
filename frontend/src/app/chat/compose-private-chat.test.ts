import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

const { mutate, revalidate } = vi.hoisted(() => ({ mutate: vi.fn(), revalidate: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  mutate,
  idempotencyKey: () => '44444444-4444-4444-8444-444444444444',
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));

import { composePrivateChatAction } from './actions';

const peer = '11111111-1111-4111-8111-111111111111';
const conversation = '22222222-2222-4222-8222-222222222222';
const message = '33333333-3333-4333-8333-333333333333';

beforeEach(() => vi.clearAllMocks());

describe('browser composer uses CSRF-bearing server mutations', () => {
  it('opens a conversation and sends a message through server actions', async () => {
    mutate.mockResolvedValueOnce({ conversation_id: conversation })
      .mockResolvedValueOnce({ message_id: message, sequence: '1' });
    const result = await composePrivateChatAction(peer, 'hello');
    expect(result).toMatchObject({ status: 'ok', conversationId: conversation });
    expect(mutate).toHaveBeenNthCalledWith(1, '/api/v1/chat/conversations', {
      body: { peerUserId: peer },
    });
    expect(mutate).toHaveBeenNthCalledWith(2, '/api/v1/chat/conversations/' + conversation + '/messages', {
      body: { body: 'hello', idempotencyKey: '44444444-4444-4444-8444-444444444444' },
    });
  });

  it('never reports a sent message if the second mutation fails', async () => {
    mutate.mockResolvedValueOnce({ conversation_id: conversation }).mockRejectedValueOnce(new Error('offline'));
    const result = await composePrivateChatAction(peer, 'hello');
    expect(result.status).toBe('error');
  });

  it('rejects malformed input without writing', async () => {
    expect((await composePrivateChatAction('not-a-uuid', 'hello')).status).toBe('error');
    expect((await composePrivateChatAction(peer, ' ')).status).toBe('error');
    expect(mutate).not.toHaveBeenCalled();
  });

  it('never bypasses the server action by direct browser POST', () => {
    const component = readFileSync('src/app/chat/compose-message-dialog.tsx', 'utf8');
    expect(component).toContain('composePrivateChatAction');
    expect(component).not.toContain("fetch('/app-api/v1/chat/conversations', {");
  });
});
