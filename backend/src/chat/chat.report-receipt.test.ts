import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PostgresChatRepository } from './chat.repository';

const actor = '11111111-1111-4111-8111-111111111111';
const conversation = '22222222-2222-4222-8222-222222222222';
const reportId = '33333333-3333-4333-8333-333333333333';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;
const query = vi.fn();
const repo = new PostgresChatRepository({ query } as unknown as Queryable);
const controller = new ChatController(new ChatService(repo));

beforeEach(() => vi.clearAllMocks());

describe('chat abuse report database receipt contract', () => {
  it('binds the actor to PostgreSQL SECURITY DEFINER report and returns its UUID', async () => {
    query.mockResolvedValueOnce({ rows: [{ report_id: reportId }] });
    await expect(controller.reportConversation(request, conversation, {
      reason: 'fraud_scam', details: '실제 사기 시도',
    })).resolves.toEqual({ ok: true, reportId });
    const [sql, args] = query.mock.calls[0] as [string, string[]];
    expect(sql).toContain('public.private_chat_report');
    expect(args).toEqual([actor, conversation, 'fraud_scam', '실제 사기 시도']);
  });

  it.each([{ rows: [] }, { rows: [{ report_id: null }] }, { rows: [{ report_id: 'not-a-uuid' }] }])(
    'rejects absent or malformed PostgreSQL report receipt %j', async (result) => {
      query.mockResolvedValueOnce(result);
      await expect(repo.reportConversation(actor, conversation, 'other', '신고 내용')).rejects.toThrow();
    },
  );
});
