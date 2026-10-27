// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HelpArticleLive } from './help-article-live';

describe('open help article expiry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ current: true, articleId: 'a1', publishedAt: '2026-10-27T06:00:00.000Z', reviewedUntil: '2026-10-28T07:00:00.000Z' }) }));
    vi.setSystemTime(new Date('2026-10-27T07:00:00.000Z'));
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('removes an open article body and source when its verified review expires', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({
      current: true, articleId: 'a1', publishedAt: '2026-10-27T06:00:00.000Z',
      reviewedUntil: '2026-10-27T07:00:01.000Z',
    }) } as Response);
    render(<HelpArticleLive locale="en" sourceHref="https://example.org/source"
      article={{ article_id: 'a1', slug: 'verified-article', published_at: '2026-10-27T06:00:00.000Z', title: 'Verified article', summary: 'Evidence', body_plain: 'Old instruction',
        reviewed_until: '2026-10-27T07:00:01.000Z' }} />);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByText('Old instruction')).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('Old instruction')).toBeNull();
    expect(screen.queryByRole('link', { name: 'View original' })).toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(/expired/);
  });
  it('removes a withdrawn article on the next 30-second publication check', async () => {
    render(<HelpArticleLive locale="en" sourceHref="https://example.org/source"
      article={{ article_id: 'a1', slug: 'verified-article', published_at: '2026-10-27T06:00:00.000Z',
        title: 'Verified article', summary: 'Evidence', body_plain: 'Withdrawn instruction',
        reviewed_until: '2026-10-28T07:00:00.000Z' }} />);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByText('Withdrawn instruction')).toBeTruthy();
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 404 } as Response);
    await act(async () => { vi.advanceTimersByTime(30_000); await Promise.resolve(); await Promise.resolve(); });
    expect(screen.queryByText('Withdrawn instruction')).toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(/unavailable|withdrawn/i);
  });
  it('fails closed if the backend status is unavailable or mismatches the published revision', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 503 } as Response);
    render(<HelpArticleLive locale="en" sourceHref={null}
      article={{ article_id: 'a1', slug: 'verified-article', published_at: '2026-10-27T06:00:00.000Z',
        title: 'Verified article', summary: 'Evidence', body_plain: 'Private stale guidance',
        reviewed_until: '2026-10-28T07:00:00.000Z' }} />);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.queryByText('Private stale guidance')).toBeNull();
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({
      current: true, articleId: 'a1', publishedAt: '2026-10-27T06:30:00.000Z',
      reviewedUntil: '2026-10-28T07:00:00.000Z',
    }) } as Response);
    await act(async () => { window.dispatchEvent(new Event('focus')); await Promise.resolve(); await Promise.resolve(); });
    expect(screen.queryByText('Private stale guidance')).toBeNull();
  });

  it('does not display an obsolete review deadline when the live status receipt has a different deadline', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({
      current: true, articleId: 'a1', publishedAt: '2026-10-27T06:00:00.000Z',
      reviewedUntil: '2026-10-27T07:30:00.000Z',
    }) } as Response);
    render(<HelpArticleLive locale="en" sourceHref="https://example.org/source"
      article={{ article_id: 'a1', slug: 'verified-article', published_at: '2026-10-27T06:00:00.000Z',
        title: 'Verified article', summary: 'Evidence', body_plain: 'Obsolete review promise',
        reviewed_until: '2026-10-28T07:00:00.000Z' }} />);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.queryByText('Obsolete review promise')).toBeNull();
    expect(screen.queryByRole('link', { name: 'View original' })).toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(/unavailable|withdrawn/i);
  });

  it('does not reuse an old verification when navigating to another article', async () => {
    const a = { article_id: 'a1', slug: 'first-article', published_at: '2026-10-27T06:00:00.000Z',
      title: 'First article', summary: 'Evidence', body_plain: 'First body', reviewed_until: '2026-10-28T07:00:00.000Z' };
    const { rerender } = render(<HelpArticleLive locale="en" sourceHref={null} article={a} />);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByText('First body')).toBeTruthy();
    vi.mocked(fetch).mockImplementationOnce(() => new Promise<Response>(() => {}));
    rerender(<HelpArticleLive locale="en" sourceHref={null}
      article={{ ...a, article_id: 'a2', slug: 'second-article', body_plain: 'Second body' }} />);
    expect(screen.queryByText('Second body')).toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(/Checking/);
  });

});
