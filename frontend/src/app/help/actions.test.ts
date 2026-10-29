import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { searchVerifiedHelp, type HelpSearchState } from './actions';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
const initial: HelpSearchState = { status: 'initial', articles: [] };
function searchForm(limit: FormDataEntryValue | null): FormData {
  const form = new FormData();
  form.set('locale', 'ko');
  form.set('query', '지갑');
  form.set('category', 'wallet');
  if (limit !== null) form.set('limit', limit);
  return form;
}

beforeEach(() => {
  vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
  vi.mocked(api).mockReset();
  vi.mocked(api).mockResolvedValue({ articles: [] });
});
afterEach(() => vi.unstubAllEnvs());

describe('verified help result count', () => {
  it.each([['10', 10], ['20', 20], ['50', 50]])('passes selected %s through the verified search API', async (raw, expected) => {
    expect(await searchVerifiedHelp(initial, searchForm(raw))).toEqual({ status: 'empty', articles: [] });
    expect(api).toHaveBeenCalledWith('/api/v1/help/search', {
      method: 'POST', body: { locale: 'ko', category: 'wallet', query: '지갑', limit: expected },
    });
  });
  it('keeps existing Android and web callers compatible when limit is omitted', async () => {
    await searchVerifiedHelp(initial, searchForm(null));
    expect(api).toHaveBeenCalledWith('/api/v1/help/search', expect.objectContaining({
      body: expect.objectContaining({ limit: 20 }),
    }));
  });
  it.each(['0', '51', '1.5', '-1', 'Infinity', 'abc', ' 10', '10 '])('rejects forged count %s before calling the backend', async raw => {
    expect(await searchVerifiedHelp(initial, searchForm(raw))).toEqual({ status: 'invalid', articles: [] });
    expect(api).not.toHaveBeenCalled();
  });
  it('does not call backend when feature flag is off', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'false');
    expect(await searchVerifiedHelp(initial, searchForm('50'))).toEqual({ status: 'unavailable', articles: [] });
    expect(api).not.toHaveBeenCalled();
  });
});
