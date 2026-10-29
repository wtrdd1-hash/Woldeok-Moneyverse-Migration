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
    const audit = await owner.query(
      `SELECT action, actor_user_id::text, target_id::text, metadata,
              sequence, integrity_hash, hash_version
       FROM public.audit_logs
       WHERE action = 'chat.conversation.reported' AND target_id = $1::uuid`, [reportId],
    );
    expect(audit.rows).toHaveLength(1);
    expect(audit.rows[0]).toMatchObject({
      action: 'chat.conversation.reported', actor_user_id: actor, target_id: reportId,
      hash_version: 2,
    });
    expect(audit.rows[0].metadata).toMatchObject({
      conversationId: conversation, reportedUserId: peer, reason: 'fraud_scam', reportId,
    });
    expect(Number(audit.rows[0].sequence)).toBeGreaterThan(0);
    expect(audit.rows[0].integrity_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('rolls back the report if the canonical audit append is rejected', async () => {
    const before = await owner.query(
      'SELECT count(*)::integer AS n FROM public.private_chat_reports WHERE conversation_id = $1::uuid',
      [conversation],
    );
    // NOT VALID still rejects new audit rows, without altering existing history.
    await owner.query(`ALTER TABLE public.audit_logs ADD CONSTRAINT chat_report_v638_audit_reject
      CHECK (action <> 'chat.conversation.reported') NOT VALID`);
    try {
      await expect(repo.reportConversation(actor, conversation, 'other', '감사 실패 시 원자성 검증'))
        .rejects.toMatchObject({ code: '23514' });
      const after = await owner.query(
        'SELECT count(*)::integer AS n FROM public.private_chat_reports WHERE conversation_id = $1::uuid',
        [conversation],
      );
      expect(after.rows[0].n).toBe(before.rows[0].n);
    } finally {
      await owner.query('ALTER TABLE public.audit_logs DROP CONSTRAINT chat_report_v638_audit_reject');
    }
  });

  it('rejects a non-participant and preserves private table ACLs', async () => {
    await expect(repo.reportConversation(outsider, conversation, 'other', '접근 거부 확인'))
      .rejects.toMatchObject({ code: '42501' });
    await app.query('SET ROLE moneyverse_app');
    await expect(app.query('SELECT * FROM public.private_chat_reports LIMIT 1'))
      .rejects.toMatchObject({ code: '42501' });
    await expect(app.query('SELECT * FROM public.audit_logs LIMIT 1'))
      .rejects.toMatchObject({ code: '42501' });
  });
});
