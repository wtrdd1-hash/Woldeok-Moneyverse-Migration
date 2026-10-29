import { afterEach, describe, expect, it, vi } from 'vitest';
import { HelpController } from './help.controller';
import type { HelpRepository } from './help.repository';

afterEach(() => vi.unstubAllEnvs());
describe('public verified help controller', () => {
  it('fails closed while feature flag is OFF', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'false');
    const controller = new HelpController({ search: vi.fn(), article: vi.fn() } as unknown as HelpRepository);
    expect(() => controller.categories()).toThrow('unavailable');
    await expect(controller.search({ locale: 'ko' })).rejects.toThrow('unavailable');
  });
  it('rejects overlong Unicode queries before reaching SQL', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const search = vi.fn();
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko', query: '😀'.repeat(101) })).rejects.toThrow('invalid');
    expect(search).not.toHaveBeenCalled();
  });
  it('returns the authoritative publication revision to web and Android without fabricating an identity', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const article = {
      article_id: '00000000-0000-0000-0000-000000000001',
      published_revision_id: '00000000-0000-0000-0000-000000000002',
      article_version: '9007199254740993',
      content_digest: 'a'.repeat(64),
    };
    const lookup = vi.fn().mockResolvedValue(article);
    const controller = new HelpController({ article: lookup } as unknown as HelpRepository);
    await expect(controller.article('ko', 'account-login')).resolves.toEqual({ article });
    expect(lookup).toHaveBeenCalledWith('ko', 'account-login');
  });
  it('returns a genuine empty result only after a successful DB read', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const search = vi.fn().mockResolvedValue([]);
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko' })).resolves.toEqual({ articles: [] });
    expect(search).toHaveBeenCalledWith('ko', null, '', 20);
  });
});
