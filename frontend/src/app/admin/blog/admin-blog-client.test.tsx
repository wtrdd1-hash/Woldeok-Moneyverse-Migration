import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminBlogClient } from './admin-blog-client';

describe('AI blog administrator editorial control tower', () => {
  it('renders truthful review hold, no unverified GREEN, and disables unreviewed publish', () => {
    const html = renderToStaticMarkup(<AdminBlogClient initialPosts={[]} />);
    expect(html).toContain('AI 블로그 발행 엔진 관제');
    expect(html).toContain('편집 검토 대기');
    expect(html).toContain('발행 승인 검증 전');
    expect(html).not.toContain('GREEN 자동 검증');
    expect(html).not.toContain('발행 엔진 활성화됨');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[^<]*(?:<[^>]+>)*[^<]*AI 블로그 즉시 생성 및 발행/s);
  });
});
