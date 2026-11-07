import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import type { Queryable } from '../core/db';
import { PostgresChatRepository } from './chat.repository';

const appUrl = process.env.MONEYVERSE_CHAT_CONSENT_PG_URL;
const migratorUrl = process.env.MONEYVERSE_CHAT_CONSENT_MIGRATOR_URL;

(appUrl && migratorUrl ? describe : describe.skip)('isolated PostgreSQL explicit chat open contract', () => {
  const actor = randomUUID();
  const peer = randomUUID();
  const outsider = randomUUID();
  let owner: Pool;
  let app: Pool;
  let repo: PostgresChatRepository;

  beforeAll(async () => {
    owner = new Pool({ connectionString: migratorUrl, max: 2 });
    app = new Pool({ connectionString: appUrl, max: 2 });
    repo = new PostgresChatRepository(app as unknown as Queryable);
    await owner.query(
      'INSERT INTO public.users(id,status) VALUES ($1,$4),($2,$4),($3,$4)',
      [actor, peer, outsider, 'active'],
    );
  });

  afterAll(async () => {
    await app?.end();
    await owner?.end();
  });

  it('does not create a conversation on an owner-scoped list read', async () => {
    const before = await owner.query(
      'SELECT count(*)::integer AS n FROM public.private_chat_conversations WHERE participant_a_id=$1 OR participant_b_id=$1',
      [actor],
    );
    expect(await repo.listConversations(actor)).toEqual([]);
    const after = await owner.query(
      'SELECT count(*)::integer AS n FROM public.private_chat_conversations WHERE participant_a_id=$1 OR participant_b_id=$1',
      [actor],
    );
    expect(after.rows[0].n).toBe(before.rows[0].n);
  });

  it('creates one owner-scoped room on explicit open and reuses its UUID on replay', async () => {
    const opened = await repo.openConversation(actor, peer);
    expect(opened.conversation_id).toMatch(/^[0-9a-f-]{36}$/i);
    const replay = await repo.openConversation(actor, peer);
    expect(replay.conversation_id).toBe(opened.conversation_id);
    const stored = await owner.query(
      'SELECT count(*)::integer AS n FROM public.private_chat_conversations WHERE id=$1::uuid',
      [opened.conversation_id],
    );
    expect(stored.rows[0].n).toBe(1);
    expect((await repo.listConversations(actor)).some((row) => row.conversation_id === opened.conversation_id)).toBe(true);
    expect(await repo.listConversations(outsider)).toEqual([]);
  });

  it('refuses invalid actors and direct app-role table access', async () => {
    await expect(repo.openConversation(actor, actor)).rejects.toThrow();
    await expect(repo.openConversation(outsider, randomUUID())).rejects.toMatchObject({ code: '28000' });
    await expect(app.query('SELECT * FROM public.private_chat_conversations LIMIT 1'))
      .rejects.toMatchObject({ code: '42501' });
  });
});
