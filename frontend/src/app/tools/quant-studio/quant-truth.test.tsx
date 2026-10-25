import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import QuantStudioLayout, { metadata } from './layout';

describe('public quant simulator disclosure', () => {
  it('identifies the sample data and non-executable orders in search metadata', () => {
    expect(String(metadata.description)).toContain('샘플');
    expect(String(metadata.description)).toContain('실제 주문');
    expect(String(metadata.title)).toContain('시뮬레이션');
  });

  it('does not advertise real market ticks or autonomous trading in structured FAQ', () => {
    const html = renderToStaticMarkup(<QuantStudioLayout>{null}</QuantStudioLayout>);
    expect(html).toContain('실제 주문을 체결하지 않습니다');
    expect(html).not.toContain('백그라운드에서 지정된 조건');
    expect(html).toContain('실제 과거 틱 데이터나 검증된 투자 성과를 제공하지 않습니다');
    expect(html).not.toContain('과거 틱 데이터 및 분봉 차트');
  });
});
