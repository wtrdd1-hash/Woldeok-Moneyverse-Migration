import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SupportFilterNav } from './support-filter-nav';

describe('support filter navigation accessibility and truthful scope', () => {
  it('announces a bounded recent window and current status without full-history claims', () => {
    const html = renderToStaticMarkup(
      <SupportFilterNav
        status="resolved"
        selected="owner-thread"
        visibleCount={0}
        windowLimit={100}
      />,
    );
    expect(html).toContain('aria-label="문의 상태 필터"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('최근 최대 100건');
    expect(html).toContain('더 오래된 문의');
    expect(html).toContain('status=resolved');
    expect(html).toContain('thread=owner-thread');
  });

  it('shows matching count without pretending it is the total archive', () => {
    const html = renderToStaticMarkup(
      <SupportFilterNav status="open" visibleCount={3} windowLimit={100} />,
    );
    expect(html).toContain('3건 표시');
    expect(html).toContain('전체 문의 이력의 검색 결과가 아닙니다.');
  });
});
