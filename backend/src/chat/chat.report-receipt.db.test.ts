import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import type { Queryable } from '../core/db';
import { PostgresChatRepository } from './chat.repository';

const appUrl = process.env.MONEYVERSE_CHAT_REPORT_PG_URL;
const migratorUrl = process.env.MONEYVERSE_CHAT_REPORT_MIGRATOR_URL;

(appUrl && migratorUrl ? describe : describe.skip)('isolated PostgreSQL private chat abuse report receipt', () => {
  const actor = randomUUID();
  const peer = randomUUID();
  const outsider = randomUUID();
  let owner: Pool;
  let app: Pool;
  let repo: PostgresChatRepository;
  let conversation: string;

  beforeAll(async () => {
    owner = new Pool({ connectionString: migratorUrl, max: 2 });
    app = new Pool({ connectionString: appUrl, max: 2 });
    repo = new PostgresChatRepository(app as unknown as Queryable);
    await owner.query('INSERT INTO public.users(id, status) VALUES ($1, $4), ($2, $4), ($3, $4)', [actor, peer, outsider, 'active']);
    const opened = await repo.openConversation(actor, peer);
    conversation = opened.conversation_id;
    await repo.sendMessage(actor, conversation, randomUUID(), '신고할 메시지');
  });

  afterAll(async () => { await app?.end(); await owner?.end(); });

  it('commits the exact owner report UUID, snapshot and audit atomically', async () => {
    const { reportId } = await repo.reportConversation(actor, conversation, 'fraud_scam', '사기 의심 메시지');
    expect(reportId).toMatch(/^[0-9a-f-]{36}$/);
    const result = await owner.query(
      `SELECT r.reporter_id::text, r.conversation_id::text, r.reason, r.details,
              jsonb_array_length(r.evidence_snapshot) AS snapshot_size
       FROM public.private_chat_reports r WHERE r.id = $1::uuid`, [reportId],
    );
    expect(result.rows[0]).toMatchObject({
      reporter_id: actor, conversation_id: conversation, reason: 'fraud_scam',
      details: '사기 의심 메시지', snapshot_size: 1,
    });
    const audit = await owner.query("SELECT count(*)::integer AS n FROM public.audit_logs WHERE action = 'CHAT_CONVERSATION_REPORTED' AND actor_user_id = $1::uuid", [actor]);
    expect(audit.rows[0].n).toBeGreaterThanOrEqual(1);
  });

  it('rejects a non-participant and preserves private table ACLs', async () => {
    await expect(repo.reportConversation(outsider, conversation, 'other', '접근 거부 확인'))
      .rejects.toMatchObject({ code: '42501' });
    await app.query('SET ROLE moneyverse_app');
    await expect(app.query('SELECT * FROM public.private_chat_reports LIMIT 1'))
      .rejects.toMatchObject({ code: '42501' });
  });
});
