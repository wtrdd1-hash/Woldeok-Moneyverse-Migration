import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { SupportController } from './support.controller';
import type { SupportRepository } from './support.repository';

const actor = '11111111-1111-4111-8111-111111111111';
const thread = '22222222-2222-4222-8222-222222222222';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('owner-only bounded support transcript', () => {
  it('requires member session and consent at the controller boundary', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, SupportController) as unknown[];
    expect(guards).toContain(SessionGuard);
    expect(guards).toContain(AuthenticatedGuard);
    expect(guards).toContain(ConsentGuard);
  });

  it('passes the session owner to the database function and never fetches more than 500 messages', async () => {
    const messages = vi.fn(async () => [{ message_id: 'id', sender_kind: 'user', body: 'Hi', created_at: new Date() }]);
    const controller = new SupportController({ messages } as unknown as SupportRepository);
    expect(await controller.transcript(request, thread)).toMatchObject({ limit: 500, truncated: false });
    expect(messages).toHaveBeenCalledWith(actor, thread, 500);
  });

  it('marks the exact 500 cap as potentially incomplete, never full history', async () => {
    const messages = vi.fn(async () => Array.from({ length: 500 }, (_, i) => ({ message_id: String(i), sender_kind: 'user', body: 'a', created_at: new Date() })));
    const controller = new SupportController({ messages } as unknown as SupportRepository);
    expect((await controller.transcript(request, thread)).truncated).toBe(true);
  });

  it('hides non-owner thread existence but does not hide unrelated SQL failures', async () => {
    const messages = vi.fn(async () => { throw Object.assign(new Error('support thread not available'), { code: '42501' }); });
    const controller = new SupportController({ messages } as unknown as SupportRepository);
    await expect(controller.transcript(request, thread)).rejects.toBeInstanceOf(NotFoundException);
    messages.mockImplementationOnce(async () => { throw Object.assign(new Error('permission denied for table'), { code: '42501' }); });
    await expect(controller.transcript(request, thread)).rejects.toThrow('permission denied for table');
  });
});
