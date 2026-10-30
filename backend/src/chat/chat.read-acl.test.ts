import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresChatRepository } from './chat.repository';

const actor = '11111111-1111-4111-8111-111111111111';
const conversation = '22222222-2222-4222-8222-222222222222';

describe('private chat read least privilege', () => {
  it('defines owner-scoped read functions with revoked raw-table access', () => {
    const migration = readFileSync(resolve(__dirname, '../../../packages/database/migrations/313-private-chat-owner-read-acl.sql'), 'utf8');
    for (const fn of ['private_chat_list_conversations', 'private_chat_list_messages', 'private_chat_total_unread', 'private_chat_archive']) {
      expect(migration).toContain('FUNCTION public.' + fn + '(');
    }
    expect(migration).toMatch(/SECURITY DEFINER/g);
    expect(migration).toContain('SET search_path = pg_catalog, pg_temp');
    expect(migration).toContain('REVOKE ALL PRIVILEGES ON TABLE public.private_chat_conversations');
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION public.private_chat_list_messages');
  });

  it('uses owner-scoped SQL functions for all member reads and archive', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new PostgresChatRepository({ query } as unknown as Queryable);
    await repo.listConversations(actor, 12);
    expect(query.mock.calls.at(-1)?.[0]).toContain('public.private_chat_list_conversations(');
    expect(query.mock.calls.at(-1)?.[1]).toEqual([actor, 12]);
    await repo.listMessages(actor, conversation, 25, '7');
    expect(query.mock.calls.at(-1)?.[0]).toContain('public.private_chat_list_messages(');
    expect(query.mock.calls.at(-1)?.[1]).toEqual([actor, conversation, '7', 25, 'before']);
    await repo.syncMessages(actor, conversation, '0', 40);
    expect(query.mock.calls.at(-1)?.[0]).toContain('public.private_chat_list_messages(');
    expect(query.mock.calls.at(-1)?.[1]).toEqual([actor, conversation, '0', 40, 'after']);
    query.mockResolvedValueOnce({ rows: [{ total_unread: '0' }] });
    await repo.totalUnreadCount(actor);
    expect(query.mock.calls.at(-1)?.[0]).toContain('public.private_chat_total_unread(');
    await repo.archiveConversation(actor, conversation, true);
    expect(query.mock.calls.at(-1)?.[0]).toContain('public.private_chat_archive(');
  });

  it('does not directly read or write revoked chat tables from the repository', () => {
    const source = readFileSync(resolve(__dirname, 'chat.repository.ts'), 'utf8');
    expect(source).not.toMatch(/FROM public\.private_chat_(?:conversations|messages|participant_state)\b/);
    expect(source).not.toMatch(/UPDATE public\.private_chat_participant_state\b/);
  });
});
