import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SeoFunnelCard } from './seo-funnel-card';

describe('SEO funnel evidence integrity', () => {
  it('must never report hardcoded ranking, CTR, indexation or conversion as LIVE observations', () => {
    const html = renderToStaticMarkup(<SeoFunnelCard />);
    for (const fabricated of ['4,870', '13.7위', '192', '651', '57.1%', '46.7%',
      '1.0위', '3.0위', '100%', 'LIVE', '1,018개', '실측 데이터 연동']) {
      expect(html).not.toContain(fabricated);
    }
    expect(html).toContain('실측 연동 미검증');
    expect(html).toContain('색인 성공으로 해석하지 않습니다');
  });
});
