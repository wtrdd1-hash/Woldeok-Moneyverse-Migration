import { afterEach, describe, expect, it, vi } from 'vitest';
import { HelpController } from './help.controller';
import type { HelpRepository } from './help.repository';

afterEach(() => vi.unstubAllEnvs());
describe('public verified help controller', () => {
  it('fails closed while feature flag is OFF', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'false');
    const controller = new HelpController({ search: vi.fn(), article: vi.fn() } as unknown as HelpRepository);
    await expect(controller.categories()).rejects.toThrow('unavailable');
    await expect(controller.search({ locale: 'ko' })).rejects.toThrow('unavailable');
  });
  it('rejects overlong Unicode queries before reaching SQL', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const search = vi.fn();
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko', query: '😀'.repeat(101) })).rejects.toThrow('invalid');
    expect(search).not.toHaveBeenCalled();
  });
  it('returns locale-scoped approved category counts and preserves the category array', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const categoryCounts = vi.fn().mockResolvedValue([
      { category: 'account', article_count: '3' },
      { category: 'support', article_count: '1' },
    ]);
    const controller = new HelpController({ categoryCounts } as unknown as HelpRepository);
    await expect(controller.categories('en')).resolves.toEqual({
      categories: ['account', 'wallet', 'shop', 'community', 'support'],
      counts: { account: '3', wallet: '0', shop: '0', community: '0', support: '1' },
      locale: 'en',
    });
    expect(categoryCounts).toHaveBeenCalledWith('en');
    await expect(controller.categories('fr')).rejects.toThrow('invalid');
    expect(categoryCounts).toHaveBeenCalledTimes(1);
  });
  it('never converts a failed category read into fabricated zero counts', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const controller = new HelpController({ categoryCounts: vi.fn().mockRejectedValue(new Error('database offline')) } as unknown as HelpRepository);
    await expect(controller.categories('ko')).rejects.toThrow('database offline');
  });
  it('returns a genuine empty result only after a successful DB read', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const search = vi.fn().mockResolvedValue([]);
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko' })).resolves.toEqual({ articles: [] });
    expect(search).toHaveBeenCalledWith('ko', null, '', 20);
  });
});
