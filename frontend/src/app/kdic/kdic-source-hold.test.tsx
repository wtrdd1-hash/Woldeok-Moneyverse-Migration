import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import KdicPage from './page';
import { metadata } from './layout';

describe('KDIC member-facing source hold', () => {
  it('does not promise statutory protection or show fabricated insurance figures', () => {
    const html = renderToStaticMarkup(<KdicPage />);
    expect(html).toContain('가상');
    expect(html).toContain('검증');
    expect(html).toContain('role="status"');
    expect(html).not.toContain('법적으로 전액 보호');
    expect(html).not.toContain('10,000,000');
    expect(html).not.toContain('500,000 WLD');
    expect(html).not.toContain('완벽 보증');
  });
  it('does not index unverified financial protection claims', () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
    expect(metadata.description).not.toContain('공식 적용');
  });
});
