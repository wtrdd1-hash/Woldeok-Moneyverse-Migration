import { describe, expect, it } from 'vitest';
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
