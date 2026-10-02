import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresChatRepository } from './chat.repository';

const actor = '11111111-1111-4111-8111-111111111111';
const conversation = '22222222-2222-4222-8222-222222222222';

function repository() {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  return { query, repo: new PostgresChatRepository({ query } as unknown as Queryable) };
}

describe('PostgresChatRepository least-privilege reads', () => {
  it('lists conversations through the granted read function', async () => {
    const { query, repo } = repository();
    await repo.listConversations(actor, 50);
    const sql = String(query.mock.calls[0]?.[0] ?? '');
    expect(sql).toContain('public.private_chat_list_conversations');
    expect(sql).not.toContain('FROM public.private_chat_conversations');
  });

  it('lists message history through the granted read function', async () => {
    const { query, repo } = repository();
    await repo.listMessages(actor, conversation, 50, 20);
    const sql = String(query.mock.calls[0]?.[0] ?? '');
    expect(sql).toContain('public.private_chat_list_messages');
    expect(sql).not.toContain('FROM public.private_chat_messages');
  });

  it('syncs message deltas through the granted read function', async () => {
    const { query, repo } = repository();
    await repo.syncMessages(actor, conversation, 10, 100);
    const sql = String(query.mock.calls[0]?.[0] ?? '');
    expect(sql).toContain('public.private_chat_sync_messages');
    expect(sql).not.toContain('FROM public.private_chat_messages');
  });

  it('archives through the granted mutation function', async () => {
    const { query, repo } = repository();
    query.mockResolvedValueOnce({ rows: [{ private_chat_archive: true }] });
    await repo.archiveConversation(actor, conversation, true);
    const sql = String(query.mock.calls[0]?.[0] ?? '');
    expect(sql).toContain('public.private_chat_archive');
    expect(sql).not.toContain('UPDATE public.private_chat_participant_state');
  });

  it('reads total unread count through the granted aggregate function', async () => {
    const { query, repo } = repository();
    query.mockResolvedValueOnce({ rows: [{ total_unread: '0' }] });
    await repo.totalUnreadCount(actor);
    const sql = String(query.mock.calls[0]?.[0] ?? '');
    expect(sql).toContain('public.private_chat_total_unread');
    expect(sql).not.toContain('FROM public.private_chat_conversations');
  });
});
