import 'reflect-metadata';
import { HEADERS_METADATA, GUARDS_METADATA } from '@nestjs/common/constants';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import type { Queryable } from '../core/db';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';

const actor = '00000000-0000-4000-8000-000000000001';
const thread = '00000000-0000-4000-8000-000000000002';
const messageId = '00000000-0000-4000-8000-000000000003';
const row = { message_id: messageId, sender_kind: 'user', body: 'Repeated body', created_at: new Date('2026-10-29T00:00:00Z') };
const request = { session: { user_id: actor } } as RequestWithSession;

describe('support exact-message receipt boundary', () => {
  it('queries a single persisted message by actor, thread and exact message UUID', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    const repository = new SupportRepository({ query } as unknown as Queryable);
    await expect(repository.exactMessage(actor, thread, messageId)).resolves.toEqual(row);
    expect(query).toHaveBeenCalledOnce();
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('public.support_my_message_receipt($1,$2,$3)');
    expect(params).toEqual([actor, thread, messageId]);
    expect(sql).not.toMatch(/FROM\s+public\.support_messages\b/i);
  });

  it('returns a verified receipt through the member route, not the truncated transcript', async () => {
    const exactMessage = vi.fn().mockResolvedValue(row);
    const controller = new SupportController({ exactMessage } as unknown as SupportRepository);
    await expect(controller.message(request, thread, messageId)).resolves.toEqual({ message: row });
    expect(exactMessage).toHaveBeenCalledWith(actor, thread, messageId);
  });

  it('returns 404 for missing owner-visible receipt and 503 without a repository', async () => {
    const controller = new SupportController({ exactMessage: vi.fn().mockResolvedValue(null) } as unknown as SupportRepository);
    await expect(controller.message(request, thread, messageId)).rejects.toBeInstanceOf(NotFoundException);
    await expect(new SupportController(null).message(request, thread, messageId)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('keeps session, authentication, consent and no-store response metadata', () => {
    const classGuards = Reflect.getMetadata(GUARDS_METADATA, SupportController) ?? [];
    expect(classGuards).toEqual(expect.arrayContaining([SessionGuard, AuthenticatedGuard, ConsentGuard]));
    const headers = Reflect.getMetadata(HEADERS_METADATA, SupportController.prototype.message) ?? [];
    expect(headers).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Cache-Control', value: 'no-store' })]));
  });
});
