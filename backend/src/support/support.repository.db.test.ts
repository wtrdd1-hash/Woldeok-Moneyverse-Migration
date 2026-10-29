import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { isMissingGrant, rejectionOf } from '../testing/database';
import { SupportRepository } from './support.repository';

/** Exercises the actual owner-scoped PostgreSQL functions in the CI disposable database. */
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!MIGRATOR_DATABASE_URL)('member support receipts in real PostgreSQL', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 }); });
  afterAll(async () => { await pool.end(); });

  const rolledBack = async (test: (client: PoolClient) => Promise<void>) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await test(client);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  };

  it('confirms new thread and reply via owner readback and refuses another member', async () => {
    await rolledBack(async (client) => {
      const owner = randomUUID();
      const stranger = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1), ($2)', [owner, stranger]);
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repo = new SupportRepository(client);
      const createKey = randomUUID();
      const created = await repo.createThread(owner, createKey, '회원 문의', '최초 문의 내용');
      expect(created?.status).toBe('open');
      expect(created?.thread_id).toMatch(/^[0-9a-f-]{36}$/);
      const threadId = created!.thread_id;
      expect((await repo.createThread(owner, createKey, '회원 문의', '최초 문의 내용'))?.thread_id).toBe(threadId);
      expect((await repo.myThreads(owner)).some((row) => row.thread_id === threadId && row.subject === '회원 문의')).toBe(true);
      expect((await repo.messages(owner, threadId)).some((row) => row.sender_kind === 'user' && row.body === '최초 문의 내용')).toBe(true);

      const replyKey = randomUUID();
      const reply = await repo.addMessage(owner, replyKey, threadId, '두 번째 답장');
      expect(reply?.sender_kind).toBe('user');
      expect(reply?.body).toBe('두 번째 답장');
      expect((await repo.addMessage(owner, replyKey, threadId, '두 번째 답장'))?.message_id).toBe(reply?.message_id);
      expect((await repo.messages(owner, threadId)).some((row) => row.message_id === reply?.message_id && row.body === '두 번째 답장')).toBe(true);
      expect((await repo.myThreads(stranger)).some((row) => row.thread_id === threadId)).toBe(false);
      expect((await repo.myThreads(owner, 'open')).some((row) => row.thread_id === threadId)).toBe(true);
      expect((await repo.myThreads(owner, 'resolved')).some((row) => row.thread_id === threadId)).toBe(false);
      expect((await repo.myThreads(stranger, 'open')).some((row) => row.thread_id === threadId)).toBe(false);

      await client.query('SAVEPOINT denied_read');
      const refused = await rejectionOf(() => repo.messages(stranger, threadId));
      expect((refused as { code?: string }).code).toBe('42501');
      expect(isMissingGrant(refused)).toBe(false);
      await client.query('ROLLBACK TO SAVEPOINT denied_read');

      await client.query('SAVEPOINT denied_table');
      const tableError = await rejectionOf(() => client.query('SELECT * FROM public.support_messages'));
      expect((tableError as { code?: string }).code).toBe('42501');
      await client.query('ROLLBACK TO SAVEPOINT denied_table');
    });
  });
});
