import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';
import { PostgresChatRepository } from './chat.repository';

const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!DATABASE_URL || !MIGRATOR_DATABASE_URL)(
  'the private-chat repository against the least-privilege database boundary',
  () => {
    let app: Pool;
    let migrator: Pool;
    let repo: PostgresChatRepository;
    const actor = randomUUID();
    const peer = randomUUID();
    let conversationId = '';

    beforeAll(async () => {
      app = new Pool({ connectionString: DATABASE_URL, max: 2 });
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
      repo = new PostgresChatRepository(app);

      await migrator.query('INSERT INTO public.users(id) VALUES($1),($2)', [actor, peer]);
      await migrator.query(
        `INSERT INTO public.identities(user_id, provider, provider_subject, display_name)
         VALUES ($1, 'discord', $3, 'Actor V506'),
                ($2, 'discord', $4, 'Peer V506')`,
        [actor, peer, `chat-v506-a-${actor}`, `chat-v506-b-${peer}`],
      );
      conversationId = (await repo.openConversation(actor, peer)).conversation_id;
    });

    afterAll(async () => {
      if (migrator) {
        if (conversationId) {
          await migrator.query('DELETE FROM public.private_chat_messages WHERE conversation_id = $1', [conversationId]);
          await migrator.query('DELETE FROM public.private_chat_participant_state WHERE conversation_id = $1', [conversationId]);
          await migrator.query('DELETE FROM public.private_chat_conversations WHERE id = $1', [conversationId]);
        }
        await migrator.query('DELETE FROM public.identities WHERE user_id = ANY($1::uuid[])', [[actor, peer]]);
        await migrator.query('DELETE FROM public.users WHERE id = ANY($1::uuid[])', [[actor, peer]]);
        await migrator.end();
      }
      if (app) await app.end();
    });

    it('keeps private chat tables unreadable by the application role', async () => {
      for (const table of [
        'private_chat_conversations',
        'private_chat_messages',
        'private_chat_participant_state',
      ]) {
        const error = await rejectionOf(() => app.query(`SELECT * FROM public.${table} LIMIT 1`));
        expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
      }
    });

    it('lists conversations through the granted function with the public member name', async () => {
      const conversations = await repo.listConversations(actor, 50);
      expect(conversations).toHaveLength(1);
      expect(conversations[0]?.conversation_id).toBe(conversationId);
      expect(conversations[0]?.peer_display_name).toBe('Peer V506');
    });

    it('sends, reads, syncs and counts unread messages without direct table grants', async () => {
      await repo.sendMessage(actor, conversationId, randomUUID(), 'v506 boundary message');

      const history = await repo.listMessages(peer, conversationId, 50);
      const sync = await repo.syncMessages(peer, conversationId, 0, 100);

      expect(history.map((message) => message.body)).toContain('v506 boundary message');
      expect(sync.map((message) => message.body)).toContain('v506 boundary message');
      expect(await repo.totalUnreadCount(peer)).toBe(1);
    });

    it('archives and unarchives through the granted mutation function', async () => {
      await expect(repo.archiveConversation(actor, conversationId, true)).resolves.toBe(true);
      await expect(repo.listConversations(actor, 50)).resolves.toHaveLength(0);

      await expect(repo.archiveConversation(actor, conversationId, false)).resolves.toBe(true);
      await expect(repo.listConversations(actor, 50)).resolves.toHaveLength(1);
    });
  },
);
