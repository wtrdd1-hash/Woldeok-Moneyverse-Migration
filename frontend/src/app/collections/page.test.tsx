import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const auth = vi.hoisted(() => vi.fn());
const backend = vi.hoisted(() => vi.fn());
vi.mock('@/lib/session', () => ({ requireMember: auth }));
vi.mock('@/lib/api', () => ({ apiOrNull: backend }));
import CollectionsPage from './page';

describe('collection server route and owner read boundary', () => {
  beforeEach(() => {
    auth.mockReset().mockResolvedValue(undefined);
    backend.mockReset().mockResolvedValue({ holdings: [] });
  });

  it('authenticates before calling the existing owner-scoped shop holdings API', async () => {
    const html = renderToStaticMarkup(await CollectionsPage());
    expect(auth).toHaveBeenCalledOnce();
    expect(backend).toHaveBeenCalledExactlyOnceWith('/api/v1/shop/holdings');
    expect(auth.mock.invocationCallOrder[0]).toBeLessThan(backend.mock.invocationCallOrder[0]!);
    expect(html).toContain('보유한 아이템이 아직 없어요');
  });

  it('does not query member holdings when authentication is denied', async () => {
    auth.mockRejectedValueOnce(new Error('not authenticated'));
    await expect(CollectionsPage()).rejects.toThrow('not authenticated');
    expect(backend).not.toHaveBeenCalled();
  });

  it('does not interpret an API outage as zero ownership', async () => {
    backend.mockResolvedValueOnce(null);
    const html = renderToStaticMarkup(await CollectionsPage());
    expect(html).toContain('보유 정보를 확인하지 못했어요');
    expect(html).not.toContain('보유한 아이템이 아직 없어요');
  });
});
