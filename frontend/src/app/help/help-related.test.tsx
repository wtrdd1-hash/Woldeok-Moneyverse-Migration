import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RelatedHelp } from './help-related';

describe('verified help related links', () => {
  it('renders accessible locale-preserving links only for approved backend results', () => {
    const html = renderToStaticMarkup(<RelatedHelp locale="en" articles={[{ article_id: '1', slug: 'wallet-basics', title: 'Wallet basics' }]} />);
    expect(html).toContain('aria-label="Related verified help"');
    expect(html).toContain('/help/wallet-basics?locale=en');
    expect(html).toContain('Wallet basics');
  });
  it('does not claim there are suggestions when no verified results exist', () => {
    expect(renderToStaticMarkup(<RelatedHelp locale="ko" articles={[]} />)).toBe('');
  });
});
