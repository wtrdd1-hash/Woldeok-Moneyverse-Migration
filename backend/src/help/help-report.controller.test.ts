import { GUARDS_METADATA } from '@nestjs/common/constants';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { HelpReportController } from './help-report.controller';
import type { HelpRepository } from './help.repository';
import type { SupportRepository } from '../support/support.repository';

const actor = '11111111-2222-4333-8444-555555555555';
const revision = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const key = '11111111-aaaa-4bbb-8ccc-222222222222';
const threadId = '22222222-3333-4444-8555-666666666666';
const req = { session: { user_id: actor } } as unknown as RequestWithSession;
const body = { idempotencyKey: key, publishedRevisionId: revision, reason: 'outdated', details: 'The current steps no longer match the wallet.' };
const article = { published_revision_id: revision, article_id: 'article' };
const stored = JSON.stringify({ kind: 'verified_help_issue', locale: 'ko', slug: 'wallet-guide', publishedRevisionId: revision, reason: 'outdated', details: body.details });

function setup() {
  const help = { article: vi.fn().mockResolvedValue(article) };
  const support = {
    createThread: vi.fn().mockResolvedValue({ thread_id: threadId, status: 'open', created_at: new Date() }),
    messages: vi.fn().mockResolvedValue([{ sender_kind: 'user', body: stored }]),
  };
  return { help, support, controller: new HelpReportController(help as unknown as HelpRepository, support as unknown as SupportRepository) };
}
afterEach(() => vi.unstubAllEnvs());

describe('owner-bound approved help correction report', () => {
  it('has session, member, consent and CSRF guards, private response headers', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, HelpReportController) as Array<{ name: string }>;
    expect(guards.map(guard => guard.name)).toEqual(['SessionGuard', 'AuthenticatedGuard', 'ConsentGuard']);
    const postGuards = Reflect.getMetadata(GUARDS_METADATA, HelpReportController.prototype.report) as Array<{ name: string }>;
    expect(postGuards.map(guard => guard.name)).toContain('CsrfGuard');
  });
  it('fails closed when either help or reports are disabled', async () => {
    const { controller, help, support } = setup();
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'false');
    vi.stubEnv('VERIFIED_HELP_REPORT_V1', 'true');
    await expect(controller.report(req, 'ko', 'wallet-guide', body)).rejects.toThrow('unavailable');
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    vi.stubEnv('VERIFIED_HELP_REPORT_V1', 'false');
    await expect(controller.report(req, 'ko', 'wallet-guide', body)).rejects.toThrow('unavailable');
    expect(help.article).not.toHaveBeenCalled();
    expect(support.createThread).not.toHaveBeenCalled();
  });
  it('rejects forged locale, slug, revision, reason and details before DB mutation', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    vi.stubEnv('VERIFIED_HELP_REPORT_V1', 'true');
    const { controller, support } = setup();
    const cases = [
      ['fr', 'wallet-guide', body], ['ko', '../admin', body],
      ['ko', 'wallet-guide', { ...body, publishedRevisionId: 'bad' }],
      ['ko', 'wallet-guide', { ...body, idempotencyKey: 'bad' }],
      ['ko', 'wallet-guide', { ...body, reason: 'other' }],
      ['ko', 'wallet-guide', { ...body, details: 'short' }],
      ['ko', 'wallet-guide', { ...body, details: 'x'.repeat(601) }],
    ] as const;
    for (const [locale, slug, value] of cases) {
      await expect(controller.report(req, locale, slug, value)).rejects.toThrow('invalid');
    }
    expect(support.createThread).not.toHaveBeenCalled();
  });
  it('does not report withdrawn or replaced published editions', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    vi.stubEnv('VERIFIED_HELP_REPORT_V1', 'true');
    const { controller, help, support } = setup();
    help.article.mockResolvedValueOnce(null).mockResolvedValueOnce({ published_revision_id: 'different' });
    await expect(controller.report(req, 'ko', 'wallet-guide', body)).rejects.toThrow('not found');
    await expect(controller.report(req, 'ko', 'wallet-guide', body)).rejects.toThrow('changed');
    expect(support.createThread).not.toHaveBeenCalled();
  });
  it('creates only an owner-bound support report and verifies persisted first message before acknowledging', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    vi.stubEnv('VERIFIED_HELP_REPORT_V1', 'true');
    const { controller, support } = setup();
    await expect(controller.report(req, 'ko', 'wallet-guide', body)).resolves.toEqual({ threadId, status: 'open', verified: true });
    expect(support.createThread).toHaveBeenCalledWith(actor, key, 'Verified help: ko/wallet-guide', stored);
    expect(support.messages).toHaveBeenCalledWith(actor, threadId, 1);
  });
  it('does not acknowledge a reused key with a different persisted report payload', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    vi.stubEnv('VERIFIED_HELP_REPORT_V1', 'true');
    const { controller, support } = setup();
    support.messages.mockResolvedValue([{ sender_kind: 'user', body: 'other' }]);
    await expect(controller.report(req, 'ko', 'wallet-guide', body)).rejects.toThrow('conflict');
  });
});
