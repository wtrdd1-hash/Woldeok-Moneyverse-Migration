import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminBlogClient } from './admin-blog-client';

describe('AI blog administrator editorial safety', () => {
  it('truthfully displays the editorial hold and never offers a broken publish action', () => {
    const html = renderToStaticMarkup(<AdminBlogClient initialPosts={[]} />);
    expect(html).toContain('자동 발행 일시 중단');
    expect(html).toContain('검증 및 편집 승인 대기');
    expect(html).toContain('IndexNow 자동 요청 중단');
    expect(html).not.toContain('매일 09:00 KST 자동 스케줄 가동 중');
    expect(html).not.toContain('AI 블로그 아티클 1편 즉시 생성');
    expect(html).not.toContain('IndexNow 활성');
  });
});
