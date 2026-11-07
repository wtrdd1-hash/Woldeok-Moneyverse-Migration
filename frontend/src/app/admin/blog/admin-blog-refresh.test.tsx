// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import type { BlogPost } from '@/app/blog/blog.types';

const mocks = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), fetch: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: mocks.success, error: mocks.error } }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));
import { AdminBlogClient } from './admin-blog-client';

const post = (slug: string, verified: boolean): BlogPost => ({
  slug, title: slug, excerpt: 'Article', content: 'Content', category: 'TECH', categoryLabel: 'Technology',
  author: { name: 'Editor', role: 'Author', badge: 'Editor' }, publishedAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z', readTimeMinutes: 1, tags: [], relatedCalculatorHref: '/blog',
  relatedCalculatorName: 'Blog', isAiGenerated: false, views: 0, status: 'PUBLISHED',
  ...(verified ? { verificationReceipt: '11111111-1111-4111-8111-111111111111' } : {}),
});

const legacy = post('legacy-local-article', false);
const old = post('old-verified-article', true);
const fresh = post('fresh-verified-article', true);

function respond(body: unknown, ok = true) {
  mocks.fetch.mockResolvedValueOnce({ ok, status: ok ? 200 : 503, json: async () => body });
}

describe('admin blog verified refresh interaction', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', mocks.fetch);
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('does not announce sync success when the authoritative API is down', async () => {
    mocks.fetch.mockRejectedValueOnce(new Error('offline'));
    render(<AdminBlogClient initialPosts={[old, legacy]} />);
    fireEvent.click(screen.getByRole('button', { name: '새로고침' }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalled());
    expect(mocks.success).not.toHaveBeenCalled();
    expect(screen.getByText('old-verified-article')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('새로고침');
  });

  it('rejects malformed success payloads without changing the displayed posts', async () => {
    respond({ success: true, verifiedCount: 2, posts: [fresh] });
    render(<AdminBlogClient initialPosts={[old, legacy]} />);
    fireEvent.click(screen.getByRole('button', { name: '새로고침' }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalled());
    expect(screen.getByText('old-verified-article')).toBeTruthy();
    expect(screen.queryByText('fresh-verified-article')).toBeNull();
  });

  it('replaces only DB-verified articles after a real backend read and preserves legacy scope', async () => {
    respond({ success: true, verifiedCount: 1, posts: [fresh], observedAt: '2026-11-02T00:00:00.000Z' });
    render(<AdminBlogClient initialPosts={[old, legacy]} />);
    fireEvent.click(screen.getByRole('button', { name: '새로고침' }));
    await waitFor(() => expect(screen.getByText('fresh-verified-article')).toBeTruthy());
    expect(screen.queryByText('old-verified-article')).toBeNull();
    expect(screen.getByText('legacy-local-article')).toBeTruthy();
    expect(mocks.fetch).toHaveBeenCalledWith('/api/admin/blog/verified-refresh', expect.objectContaining({ cache: 'no-store', credentials: 'same-origin' }));
    expect(mocks.success).toHaveBeenCalledWith(expect.stringContaining('검증된 게시물'));
    expect(screen.getAllByRole('status').some((element) => element.textContent?.includes('기존 로컬 글'))).toBe(true);
  });

  it('distinguishes an authoritative zero verified list from an outage', async () => {
    respond({ success: true, verifiedCount: 0, posts: [], observedAt: '2026-11-02T00:00:00.000Z' });
    render(<AdminBlogClient initialPosts={[old, legacy]} />);
    fireEvent.click(screen.getByRole('button', { name: '새로고침' }));
    await waitFor(() => expect(mocks.success).toHaveBeenCalled());
    expect(screen.queryByText('old-verified-article')).toBeNull();
    expect(screen.getByText('legacy-local-article')).toBeTruthy();
  });
});
