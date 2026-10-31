import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }) }));
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminBlogClient } from './admin-blog-client';

describe('AI blog administrator editorial control tower', () => {
  it('renders the source gate without requiring human approval and disables manual unverified publish', () => {
    const html = renderToStaticMarkup(<AdminBlogClient initialPosts={[]} />);
    expect(html).toContain('AI 블로그 발행 엔진 관제');
    expect(html).toContain('품질 검증 기반');
    expect(html).toContain('검증 미통과 원고는 게시하지 않습니다');
    expect(html).not.toContain('베트남 (VND)');
    expect(html).toContain('중국 (CNY)');
    expect(html).not.toContain('GREEN 자동 검증');
    expect(html).not.toContain('발행 엔진 활성화됨');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[^<]*(?:<[^>]+>)*[^<]*AI 블로그 즉시 생성 및 발행/s);
  });
});
