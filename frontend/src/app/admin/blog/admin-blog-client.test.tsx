import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminBlogClient } from './admin-blog-client';

describe('AI blog administrator editorial control tower', () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
  it('shows honest initial state and a working status refresh without a fake manual publisher', () => {
    const html = renderToStaticMarkup(<AdminBlogClient initialPosts={[]} />);
    expect(html).toContain('AI 블로그 발행 엔진 관제');
    expect(html).toContain('자동 발행 검증 대기');
    expect(html).toContain('발행 서버 상태 새로고침');
    expect(html).toContain('발행 서버의 실제 상태를 확인하고 있습니다.');
    expect(html).toContain('안전한 관리자 생성 API 구현 전 미제공');
    expect(html).toContain('한국·미국·일본·중국');
    expect(html).not.toContain('AI 블로그 즉시 생성 및 발행');
    expect(html).not.toContain('발행 엔진 활성화됨');
    expect(html).toMatch(/aria-label="블로그 발행 서버 상태 새로고침"/);
    expect(html).toContain('sm:flex-row');
    expect(html).toContain('whitespace-normal');
  });
  it('reads verified backend publisher state and refreshes without a fake manual publish action', async () => {
    const response = (enabled: boolean) => new Response(JSON.stringify({
      success: true, automaticEnabled: enabled, manualEnabled: false,
      modelVerified: enabled, verifiedPublishedCount: 2,
    }), { status: 200 });
    const fetchMock = vi.fn().mockResolvedValueOnce(response(false)).mockResolvedValueOnce(response(true));
    vi.stubGlobal('fetch', fetchMock);
    render(<AdminBlogClient initialPosts={[]} />);
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('활성 상태로 확인되지 않았습니다'));
    fireEvent.click(screen.getByRole('button', { name: '블로그 발행 서버 상태 새로고침' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('서버에서 자동 발행 설정을 확인했습니다'));
    expect(screen.getByText('서버에서 조회한 검증된 게시물: 2건')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/blog/publisher-status', expect.objectContaining({ cache: 'no-store' }));
    expect(screen.queryByText('AI 블로그 즉시 생성 및 발행')).toBeNull();
  });

  it('does not claim publisher readiness if backend verification is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('backend offline')));
    render(<AdminBlogClient initialPosts={[]} />);
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('발행 서버 상태 확인 실패'));
    expect(screen.getByText('자동 발행 검증 대기')).toBeTruthy();
  });
});
