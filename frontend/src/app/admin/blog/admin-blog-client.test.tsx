import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { BlogPost } from '@/app/blog/blog.types';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminBlogClient } from './admin-blog-client';

describe('AI blog administrator editorial control tower', () => {
  it('renders active AI blog generation interface and publish trigger for administrators', () => {
    const html = renderToStaticMarkup(<AdminBlogClient initialPosts={[]} />);
    expect(html).toContain('AI 블로그 발행 엔진 관제');
    expect(html).toContain('발행 엔진 활성화됨');
    expect(html).toContain('AI 블로그 즉시 생성 및 발행');
    expect(html).toContain('GREEN 자동 검증');
  });
});

const examplePost = {
  slug: '2026-10-23-kr-wealth-test',
  title: 'Example verified article',
  category: 'WEALTH',
  categoryLabel: 'Wealth',
  publishedAt: '2026-10-23T10:00:00.000Z',
  country: 'KR',
  status: 'PUBLISHED',
} as BlogPost;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Blog admin keyboard and accessible mutation feedback', () => {
  it('sends exact slug confirmation only after explicit irreversible purge consent', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, action: 'PURGED' }) });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<AdminBlogClient initialPosts={[examplePost]} />);
    fireEvent.click(screen.getByRole('button', { name: '영구삭제' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/blog/2026-10-23-kr-wealth-test?purge=true',
      { method: 'DELETE', headers: { 'x-blog-purge-confirmation': examplePost.slug } },
    );
    expect((await screen.findByRole('status')).textContent).toContain('글이 영구 삭제되었습니다.');
  });

  it('does not send a destructive request when confirmation is declined', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<AdminBlogClient initialPosts={[examplePost]} />);
    fireEvent.click(screen.getByRole('button', { name: '영구삭제' }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('announces a failed withdrawal as an accessible error without removing the article', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'console_locked' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<AdminBlogClient initialPosts={[examplePost]} />);
    fireEvent.click(screen.getByRole('button', { name: '철회' }));
    expect((await screen.findByRole('alert')).textContent).toContain('console_locked');
    expect(screen.getByRole('link', { name: 'Example verified article' })).toBeTruthy();
  });
});
