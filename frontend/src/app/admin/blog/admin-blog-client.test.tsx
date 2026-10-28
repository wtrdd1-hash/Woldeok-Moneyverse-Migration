import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminBlogClient } from './admin-blog-client';

describe('AI blog administrator editorial control tower', () => {
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
});
