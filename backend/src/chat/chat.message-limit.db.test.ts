import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import type { Queryable } from '../core/db';
import { PostgresChatRepository } from './chat.repository';

const connectionString = process.env.MONEYVERSE_CHAT_PAGING_PG_URL;
const actor = '11111111-1111-4111-8111-111111111111';
const outsider = '33333333-3333-4333-8333-333333333333';
const conversation = '22222222-2222-4222-8222-222222222222';

(connectionString ? describe : describe.skip)('isolated PostgreSQL private chat paging', () => {
  let pool: Pool;
  let repo: PostgresChatRepository;

  beforeAll(() => {
    pool = new Pool({ connectionString, max: 2 });
    repo = new PostgresChatRepository(pool as unknown as Queryable);
  });

  afterAll(async () => { await pool?.end(); });

  it('returns the exact requested history window for a participant', async () => {
    const rows = await repo.listMessages(actor, conversation, 2);
    expect(rows.map((row) => row.sequence)).toEqual(['3', '2']);
  });

  it('returns exact ordered delta for a participant', async () => {
    const rows = await repo.syncMessages(actor, conversation, 1, 2);
    expect(rows.map((row) => row.sequence)).toEqual(['2', '3']);
  });

  it('does not disclose a conversation to an outsider', async () => {
    expect(await repo.listMessages(outsider, conversation, 100)).toEqual([]);
    expect(await repo.syncMessages(outsider, conversation, 0, 200)).toEqual([]);
  });

  it('keeps the application reader unable to change chat messages', async () => {
    await expect(pool.query('UPDATE public.private_chat_messages SET body = $1 WHERE sequence = 1', ['tampered']))
      .rejects.toMatchObject({ code: '42501' });
  });
});
