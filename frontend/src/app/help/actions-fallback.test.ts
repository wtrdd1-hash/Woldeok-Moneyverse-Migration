import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/api', () => ({ api: vi.fn() }));
import { api } from '@/lib/api';
import { searchVerifiedHelp } from './actions';
const initial = { status: 'initial' as const, articles: [] };
function form(fallback?: string) { const data = new FormData(); data.set('locale','ko'); data.set('query','login'); if (fallback !== undefined) data.set('fallbackToOtherLocale',fallback); return data; }
beforeEach(() => { vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true'); vi.clearAllMocks(); });
afterEach(() => vi.unstubAllEnvs());
describe('verified bilingual help search action', () => {
  it('opts in only with the checkbox and identifies genuine alternate-language articles', async () => {
    vi.mocked(api).mockResolvedValueOnce({ articles: [{ article_id: 'b', locale: 'en', slug: 'account', title: 'Account', summary: 'Help', category: 'account' }], fallbackUsed: true, requestedLocale: 'ko', resultLocale: 'en' });
    const result = await searchVerifiedHelp(initial, form('on'));
    expect(result.status).toBe('results');
    expect(result.fallbackUsed).toBe(true);
    expect(result.resultLocale).toBe('en');
    expect(api).toHaveBeenCalledWith('/api/v1/help/search', expect.objectContaining({ method: 'POST', body: expect.objectContaining({ fallbackToOtherLocale: true }) }));
  });
  it('never silently enables fallback for absent checkbox', async () => {
    vi.mocked(api).mockResolvedValueOnce({ articles: [] });
    const result = await searchVerifiedHelp(initial, form());
    expect(result.status).toBe('empty');
    expect(api).toHaveBeenCalledWith('/api/v1/help/search', expect.objectContaining({ body: expect.objectContaining({ fallbackToOtherLocale: false }) }));
  });
  it('rejects tampered checkbox and never contacts backend', async () => {
    expect((await searchVerifiedHelp(initial, form('true'))).status).toBe('invalid');
    expect(api).not.toHaveBeenCalled();
  });
  it('does not claim fallback success on DB failure', async () => {
    vi.mocked(api).mockRejectedValueOnce(new Error('unavailable'));
    expect((await searchVerifiedHelp(initial, form('on'))).status).toBe('unavailable');
  });
});
