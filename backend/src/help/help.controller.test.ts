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
  it('returns a genuine empty result only after a successful DB read', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    const search = vi.fn().mockResolvedValue([]);
    const controller = new HelpController({ search } as unknown as HelpRepository);
    await expect(controller.search({ locale: 'ko' })).resolves.toEqual({ articles: [] });
    expect(search).toHaveBeenCalledWith('ko', null, '', 20);
  });
});
