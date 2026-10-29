import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: apiMock }));
import { searchVerifiedHelp } from './actions';

const form = (query: string) => {
  const data = new FormData();
  data.set('locale', 'ko');
  data.set('query', query);
  data.set('category', 'account');
  return data;
};

beforeEach(() => { vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true'); apiMock.mockReset().mockResolvedValue({ articles: [{ article_id: 'verified' }] }); });
afterEach(() => vi.unstubAllEnvs());

describe('verified help web query normalization', () => {
  it('sends a canonical whitespace query to the private API', async () => {
    const result = await searchVerifiedHelp({ status: 'initial', articles: [] }, form('  로그인\u00a0\t 도움말  '));
    expect(result.status).toBe('results');
    expect(apiMock).toHaveBeenCalledWith('/api/v1/help/search', expect.objectContaining({
      method: 'POST', body: { locale: 'ko', category: 'account', query: '로그인 도움말', limit: 20 },
    }));
  });
  it('rejects oversized raw input without any database request', async () => {
    const result = await searchVerifiedHelp({ status: 'initial', articles: [] }, form(' '.repeat(101)));
    expect(result.status).toBe('invalid');
    expect(apiMock).not.toHaveBeenCalled();
  });
});
