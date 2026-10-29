import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
const mocks = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: mocks.api, ApiError: class extends Error {} }));
vi.mock('next/link', () => ({ default: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('not found'); } }));
import HelpArticlePage, { dynamic, metadata } from './page';

afterEach(() => { vi.unstubAllEnvs(); mocks.api.mockReset(); });
const article = { article_id: 'article', slug: 'wallet', title: 'Wallet', summary: 'Verified', body_plain: 'body',
  source_url: 'https://example.org', published_at: '2026-10-29T00:00:00Z', estimated_reading_minutes: 2 };

describe('approved help article reading estimate', () => {
  it('renders localized approximate time for a genuine backend estimate', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    mocks.api.mockResolvedValue({ article });
    const html = renderToStaticMarkup(await HelpArticlePage({ params: Promise.resolve({ slug: 'wallet' }), searchParams: Promise.resolve({ locale: 'en' }) }));
    expect(html).toContain('About 2 min read');
    expect(html).toContain('Verified');
    expect(mocks.api).toHaveBeenCalledWith('/api/v1/help/articles/en/wallet');
  });
  it('labels Korean article estimates as approximate minutes', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    mocks.api.mockResolvedValue({ article });
    const html = renderToStaticMarkup(await HelpArticlePage({ params: Promise.resolve({ slug: 'wallet' }), searchParams: Promise.resolve({ locale: 'ko' }) }));
    expect(html).toContain('약 2분 소요');
  });
  it('does not invent a reading time when upstream evidence is invalid', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    mocks.api.mockResolvedValue({ article: { ...article, estimated_reading_minutes: -4 } });
    const html = renderToStaticMarkup(await HelpArticlePage({ params: Promise.resolve({ slug: 'wallet' }) }));
    expect(html).not.toContain('min read');
    expect(html).not.toContain('분 소요');
  });
  it('keeps the gated detail unindexed', () => {
    expect(dynamic).toBe('force-dynamic');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
