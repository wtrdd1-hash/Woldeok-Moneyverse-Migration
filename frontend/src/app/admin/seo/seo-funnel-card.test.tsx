import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SeoFunnelCard } from './seo-funnel-card';

describe('SEO funnel evidence integrity', () => {
  it('must never report fabricated mock ranking or conversions while reflecting genuine GSC metrics', () => {
    const html = renderToStaticMarkup(<SeoFunnelCard />);
    // 과거 허위 모의 수치가 전혀 없어야 함
    for (const fabricated of ['4,870', '13.7위', '192', '651', '57.1%', '46.7%',
      '1.0위', '3.0위', '100%', '1,018개']) {
      expect(html).not.toContain(fabricated);
    }
    // 사용자 제공 GSC 실제 실측 캡처 데이터가 올바르게 렌더링되어야 함
    expect(html).toContain('1.05만회');
    expect(html).toContain('83회');
    expect(html).toContain('18.1위');
    expect(html).toContain('3.74천회');
    expect(html).toContain('21회');
  });
});
