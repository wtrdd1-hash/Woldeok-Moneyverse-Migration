// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderBlogMarkdownBlocks } from './blog-markdown';

function html(content: string): string {
  return renderToStaticMarkup(<div>{renderBlogMarkdownBlocks(content)}</div>);
}

describe('Blog Markdown rendering regression v969', () => {
  it('separates an adjacent heading and table without blank lines (legacy macro snapshot)', () => {
    const content = [
      '### 🌐 실시간 거시경제 펄스 스냅샷 (기준: 2026. 10. 16.)',
      '| 지표 | 최신 수치 | 출처 |',
      '| :--- | :---: | :--- |',
      '| **원/달러 환율** | **1,385.5원** | Yahoo Finance |',
      '',
      '성공적인 재테크의 본질은 **검증된 금융 공학**입니다.',
    ].join('\n');
    const rendered = html(content);
    expect(rendered).toContain('<h3');
    expect(rendered).toContain('<table');
    expect(rendered).toContain('<th');
    expect(rendered).toContain('<strong>원/달러 환율</strong>');
    expect(rendered).toContain('<strong>검증된 금융 공학</strong>');
    expect(rendered).not.toContain('| :---');
    expect(rendered).not.toContain('**');
  });

  it('renders lists, blockquote, and code fences as distinct safe blocks', () => {
    const rendered = html('## 복리\n\n1. **원금**\n2. 매월 납입\n\n> 본문 인용\n\n```txt\nP * (1+r)\n```');
    expect(rendered).toContain('<h2');
    expect(rendered).toContain('<ol');
    expect(rendered).toContain('<li');
    expect(rendered).toContain('<blockquote');
    expect(rendered).toContain('<pre');
    expect(rendered).toContain('P * (1+r)');
  });

  it('does not inject HTML, javascript URLs, or external image requests', () => {
    const rendered = html('<img src=x onerror=alert(1)>\n\n[악성링크](javascript:alert(1))\n\n![track](https://tracker.example/x.png)');
    expect(rendered).not.toContain('<img');
    expect(rendered).not.toContain('href="javascript:');
    expect(rendered).toContain('&lt;img');
  });

  it('accepts safe blog-local images and normal HTTPS reference links', () => {
    const rendered = html('![복리 곡선](/images/blog/compound-interest-72-rule.svg)\n\n[한국은행](https://www.bok.or.kr)');
    expect(rendered).toContain('src="/images/blog/compound-interest-72-rule.svg"');
    expect(rendered).toContain('href="https://www.bok.or.kr"');
  });
});
