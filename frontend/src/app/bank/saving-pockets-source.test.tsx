import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SavingPocketsSource } from './saving-pockets-source';

vi.mock('@/components/locale-provider', () => ({
  useLocale: () => ({ locale: 'ko', setLocale: () => {} }),
}));

describe('bank owner saving pocket states', () => {
  it('renders an accessible retry rather than a forged empty list on upstream outage', () => {
    const html = renderToStaticMarkup(
      <SavingPocketsSource raw={null} cashBalance="100" bankBalance="200" locale="ko" />,
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain('저축 포켓을 확인할 수 없습니다');
    expect(html).toContain('다시 조회');
    expect(html).toContain('href="/bank"');
    expect(html).not.toContain('아직 개설된 저축 포켓이 없어요');
    expect(html).not.toContain('새 포켓 개설');
  });
  it('keeps a verified empty list distinct from an outage', () => {
    const html = renderToStaticMarkup(
      <SavingPocketsSource raw={[]} cashBalance="100" bankBalance="200" locale="ko" />,
    );
    expect(html).toContain('아직 개설된 저축 포켓이 없어요');
    expect(html).not.toContain('저축 포켓을 확인할 수 없습니다');
  });
});
