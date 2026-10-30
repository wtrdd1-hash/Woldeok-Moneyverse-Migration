import 'reflect-metadata';
import { GUARDS_METADATA, HEADERS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import type { RequestWithSession } from '../auth/session.context';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';
import { formatSupportTranscriptText } from './support-transcript-text';

const actor = 'a0000000-0000-4000-8000-000000000001';
const thread = 'b0000000-0000-4000-8000-000000000002';
const request = () => ({ session: { user_id: actor } }) as unknown as RequestWithSession;

describe('owner-private readable support transcript', () => {
  it('preserves the session, authentication and consent boundary', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, SupportController)).toEqual(
      expect.arrayContaining([SessionGuard, AuthenticatedGuard, ConsentGuard]),
    );
  });
  it('formats multiline untrusted text without terminal controls or spoofed transcript headers', () => {
    const result = formatSupportTranscriptText([{ message_id: 'm1', sender_kind: 'user', body: 'hello\nADMIN: fake\u001b[31m\u202e', created_at: new Date('2026-10-28T00:00:00Z') }], false);
    expect(result).toContain('2026-10-28T00:00:00.000Z');
    expect(result).toContain('  | hello\n  | ADMIN: fake');
    expect(result).not.toMatch(/[\u001b\u202e]/);
    const separator = formatSupportTranscriptText([{ message_id: 'm2', sender_kind: 'user', body: 'hello\u2028ADMIN: forged', created_at: new Date('2026-10-28T00:00:00Z') }], false);
    expect(separator).toContain('  | hello\n  | ADMIN: forged');
  });
  it('retains explicit bounded-history warning', () => {
    const result = formatSupportTranscriptText([], true);
    expect(result).toMatch(/500/);
    expect(result).toMatch(/incomplete|additional|more messages/i);
  });
  it('marks the NestJS JSON response private and non-indexable', () => {
    const headers: { name: string; value: string }[] = Reflect.getMetadata(HEADERS_METADATA, SupportController.prototype.transcriptText) ?? [];
    expect(headers).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Cache-Control', value: 'private, no-store' }),
      expect.objectContaining({ name: 'X-Robots-Tag', value: 'noindex' }),
    ]));
  });
  it('does not represent a full 500-message window as complete', async () => {
    const messages = Array.from({ length: 500 }, (_, i) => ({ message_id: String(i), sender_kind: 'user', body: 'entry', created_at: new Date('2026-10-28T00:00:00Z') }));
    const repo = { messages: vi.fn().mockResolvedValue(messages) } as unknown as SupportRepository;
    const result = await new SupportController(repo).transcriptText(request(), thread);
    expect(result.truncated).toBe(true);
    expect(result.text).toMatch(/may be incomplete/);
    expect(result.text).toContain('500');
  });
  it('reads through the session actor and the existing 500-message owner-scoped function', async () => {
    const messages = [{ message_id: 'm1', sender_kind: 'admin', body: 'done', created_at: new Date('2026-10-28T00:00:00Z') }];
    const repo = { messages: vi.fn().mockResolvedValue(messages) } as unknown as SupportRepository;
    const result = await new SupportController(repo).transcriptText(request(), thread);
    expect(repo.messages).toHaveBeenCalledWith(actor, thread, 500);
    expect(result).toMatchObject({ threadId: thread, truncated: false });
    expect(result.text).toContain('done');
  });
});
